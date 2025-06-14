import {
  convertInchesToTwip,
  Packer,
  Document,
  Paragraph,
  ParagraphChild,
  Table,
  TableRow,
  TableCell,
  TableOfContents,
  TextRun,
  ImageRun,
  ExternalHyperlink,
  Math,
  HeadingLevel,
  LevelFormat,
  AlignmentType,
  IImageOptions,
  ILevelsOptions,
  FootnoteReferenceRun,
  CheckBox,
  IDocumentBackgroundOptions,
  IStylesOptions,
} from "docx";
import type * as mdast from "./models/mdast";
import { parseLatex } from "./latex";
import { invariant, unreachable } from "./utils";

const ORDERED_LIST_REF = "ordered";
const INDENT = 0.5;
const DEFAULT_NUMBERINGS: ILevelsOptions[] = [
  {
    level: 0,
    format: LevelFormat.DECIMAL,
    text: "%1.",
    alignment: AlignmentType.START,
    style: {
      paragraph: {
        indent: {
          left: convertInchesToTwip(.5),
          hanging: convertInchesToTwip(.35)
        },
        spacing: {
          after: convertInchesToTwip(0.139),
          line: convertInchesToTwip(0.1919)
        }
      },
    }
  },
  {
    level: 1,
    format: LevelFormat.LOWER_LETTER,
    text: "(%2) ",
    alignment: AlignmentType.START,
    style: {
      paragraph: {
        indent: {
          left: convertInchesToTwip(.81),
          hanging: convertInchesToTwip(.31),
        },
        spacing: {
          after: convertInchesToTwip(0.139),
          line: convertInchesToTwip(0.1919)
        }
      },
    },
  },
  {
    level: 2,
    format: LevelFormat.DECIMAL,
    text: "%3.",
    alignment: AlignmentType.START,
    style: {
      paragraph: {
        indent: { start: convertInchesToTwip(INDENT * 2) },
      },
    },
  },
  {
    level: 3,
    format: LevelFormat.DECIMAL,
    text: "%4.",
    alignment: AlignmentType.START,
    style: {
      paragraph: {
        indent: { start: convertInchesToTwip(INDENT * 3) },
      },
    },
  },
  {
    level: 4,
    format: LevelFormat.DECIMAL,
    text: "%5.",
    alignment: AlignmentType.START,
    style: {
      paragraph: {
        indent: { start: convertInchesToTwip(INDENT * 4) },
      },
    },
  },
  {
    level: 5,
    format: LevelFormat.DECIMAL,
    text: "%6.",
    alignment: AlignmentType.START,
    style: {
      paragraph: {
        indent: { start: convertInchesToTwip(INDENT * 5) },
      },
    },
  },
];

export type ImageDataMap = { [url: string]: ImageData };

export type ImageData = {
  image: IImageOptions["data"];
  width: number;
  height: number;
};

export type ImageResolver = (url: string) => Promise<ImageData> | ImageData;

type Decoration = Readonly<{
  [key in (mdast.Emphasis | mdast.Strong | mdast.Delete)["type"]]?: true;
}>;

type ListInfo = Readonly<{
  level: number;
  ordered: boolean;
  checked?: boolean;
}>;

type Context = Readonly<{
  deco: Decoration;
  images: ImageDataMap;
  indent: number;
  list?: ListInfo;
}>;

export interface DocxOptions {
  title?: string;
  subject?: string;
  creator?: string;
  keywords?: string;
  description?: string;
  lastModifiedBy?: string;
  revision?: number;
  styles?: IStylesOptions;
  background?: IDocumentBackgroundOptions;

  /**
   * Set output type of `VFile.result`. `buffer` is `Promise<Buffer>`. `blob` is `Promise<Blob>`.
   */
  output?: "buffer" | "blob";
  /**
   * **You must set** if your markdown includes images. See example for [browser](https://github.com/inokawa/remark-docx/blob/main/stories/playground.stories.tsx) and [Node.js](https://github.com/inokawa/remark-docx/blob/main/src/index.spec.ts).
   */
  imageResolver?: ImageResolver;
}

type DocxChild = Paragraph | Table | TableOfContents;
type DocxContent = DocxChild | ParagraphChild;

export interface Footnotes {
  [key: string]: { children: Paragraph[] };
}

// type to define the return value of `convertNodes`
export interface ConvertNodesReturn {
  nodes: DocxContent[];
  footnotes: Footnotes;
}

export const mdastToDocx = async (
  node: mdast.Root,
  {
    output = "buffer",
    title,
    subject,
    creator,
    keywords,
    description,
    lastModifiedBy,
    revision,
  }: DocxOptions,
  images: ImageDataMap
): Promise<any> => {
  const { nodes } = convertNodes(node.children, {
    deco: {},
    images,
    indent: 0
  });
  const doc = new Document({
    title,
    subject,
    creator,
    keywords,
    description,
    lastModifiedBy,
    revision,
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: "14pt",
          }
        }
      }
    },
    sections: [{ children: nodes as DocxChild[] }],
    numbering: {
      config: [
        {
          reference: ORDERED_LIST_REF,
          levels: DEFAULT_NUMBERINGS,
        },
      ],
    },
  });

  switch (output) {
    case "buffer":
      const bufOut = await Packer.toBuffer(doc);
      // feature detection instead of environment detection, but if Buffer exists
      // it's probably Node. If not, return the Uint8Array that JSZip returns
      // when it doesn't detect a Node environment.
      return typeof Buffer === "function" ? Buffer.from(bufOut) : bufOut;
    case "blob":
      return Packer.toBlob(doc);
  }
};

const convertNodes = (
  nodes: mdast.Content[],
  ctx: Context
): ConvertNodesReturn => {
  const results: DocxContent[] = [];
  let footnotes: Footnotes = {};
  for (const node of nodes) {
    // console.log(node.depth, node.type, node?.children?.map(c => c.type + " " + c.value));

    switch (node.type) {
      case "paragraph":
        results.push(buildParagraph(node, ctx));
        break;
      case "heading":
        results.push(buildHeading(node, ctx));
        break;
      case "thematicBreak":
        results.push(buildThematicBreak(node));
        break;
      case "blockquote":
        results.push(...buildBlockquote(node, ctx));
        break;
      case "list":
        results.push(...buildList(node, ctx));
        break;
      case "listItem":
        invariant(false, "unreachable");
      case "table":
        results.push(buildTable());
        break;
      case "tableRow":
        invariant(false, "unreachable");
      case "tableCell":
        invariant(false, "unreachable");
      case "html":
        results.push(buildHtml(node));
        break;
      case "code":
        results.push(buildCode(node));
        break;
      case "yaml":
        // FIXME: unimplemented
        break;
      case "toml":
        // FIXME: unimplemented
        break;
      case "definition":
        // FIXME: unimplemented
        break;
      case "footnoteDefinition":
        footnotes[node.identifier] = buildFootnoteDefinition(node, ctx);
        break;
      case "text":
        results.push(buildText(node.value, ctx.deco));
        break;
      case "emphasis":
      case "strong":
      case "delete": {
        const { type, children } = node;
        const { nodes } = convertNodes(children, {
          ...ctx,
          deco: { ...ctx.deco, [type]: true },
        });
        results.push(...nodes);
        break;
      }
      case "inlineCode":
        // FIXME: transform to text for now
        results.push(buildText(node.value, ctx.deco));
        break;
      case "break":
        results.push(buildBreak(node));
        break;
      case "link":
        results.push(buildLink(node, ctx));
        break;
      case "image":
        results.push(buildImage(node, ctx.images));
        break;
      case "linkReference":
        // FIXME: unimplemented
        break;
      case "imageReference":
        // FIXME: unimplemented
        break;
      case "footnoteReference":
        // do we need context here?
        results.push(buildFootnoteReference(node));
        break;
      case "math":
        results.push(...buildMath(node));
        break;
      case "inlineMath":
        results.push(buildInlineMath(node));
        break;
      default:
        unreachable(node);
        break;
    }
  }
  return {
    nodes: results,
    footnotes,
  };
};

const buildParagraph = ({ children }: mdast.Paragraph, ctx: Context) => {
  const list = ctx.list;
  const { nodes } = convertNodes(children, ctx);

  if (list && list.checked != null) {
    nodes.unshift(
      new CheckBox({
        checked: list.checked,
        checkedState: { value: "2611" },
        uncheckedState: { value: "2610" },
      })
    );
  }
  return new Paragraph({
    children: nodes,
    indent:
      ctx.indent > 0
        ? {
          start: convertInchesToTwip(INDENT * ctx.indent),
        }
        : undefined,
    ...(list &&
      (list.ordered
        ? {
          numbering: {
            reference: ORDERED_LIST_REF,
            level: list.level,
          },
        }
        : {
          bullet: {
            level: list.level,
          },
        })),
  });
};

const buildHeading = ({ children, depth }: mdast.Heading, ctx: Context) => {
  let heading: string;
  switch (depth) {
    case 1:
      heading = HeadingLevel.TITLE;
      break;
    case 2:
      heading = HeadingLevel.HEADING_1;
      break;
    case 3:
      heading = HeadingLevel.HEADING_2;
      break;
    case 4:
      heading = HeadingLevel.HEADING_3;
      break;
    case 5:
      heading = HeadingLevel.HEADING_4;
      break;
    case 6:
      heading = HeadingLevel.HEADING_5;
      break;
  }
  const { nodes } = convertNodes(children, ctx);
  return new Paragraph({
    heading: heading as any,
    children: nodes,
  });
};

const buildThematicBreak = (_: mdast.ThematicBreak) => {
  return new Paragraph({
    thematicBreak: true,
  });
};

const buildBlockquote = ({ children }: mdast.Blockquote, ctx: Context) => {
  const { nodes } = convertNodes(children, { ...ctx, indent: ctx.indent + 1 });
  return nodes;
};

const buildList = (
  { children, ordered, start: _start, spread: _spread }: mdast.List,
  ctx: Context
) => {
  const list: ListInfo = {
    level: ctx.list ? ctx.list.level + 1 : 0,
    ordered: true,
  };
  return children.flatMap((item) => {
    return buildListItem(item, {
      ...ctx,
      list,
    });
  });
};

const buildListItem = (
  { children, checked, spread: _spread }: mdast.ListItem,
  ctx: Context
) => {
  const ctx2 = {
    ...ctx,
    ...(ctx.list && { list: { ...ctx.list, checked: checked ?? undefined } }),
  };

  const { nodes } = convertNodes(children, ctx2);
  return nodes;
};

const buildTable = () => {
  return new Paragraph({
    children: [buildText("[TABLE]", { strong: true })],
  });
};

const buildHtml = ({ value }: mdast.HTML) => {
  // FIXME: transform to text for now
  return new Paragraph({
    children: [buildText(value, {})],
  });
};

const buildCode = ({ value, lang: _lang, meta: _meta }: mdast.Code) => {
  // FIXME: transform to text for now
  return new Paragraph({
    children: [buildText(value, {})],
  });
};

const buildMath = ({ value }: mdast.Math) => {
  return parseLatex(value).map(
    (runs) =>
      new Paragraph({
        children: [
          new Math({
            children: runs,
          }),
        ],
      })
  );
};

const buildInlineMath = ({ value }: mdast.InlineMath) => {
  return new Math({
    children: parseLatex(value).flatMap((runs) => runs),
  });
};

const buildText = (text: string, deco: Decoration) => {
  return new TextRun({
    text,
    bold: deco.strong,
    italics: deco.emphasis,
    strike: deco.delete,
  });
};

const buildBreak = (_: mdast.Break) => {
  return new TextRun({ text: "", break: 1 });
};

const buildLink = (
  { children, url, title: _title }: mdast.Link,
  ctx: Context
) => {
  const { nodes } = convertNodes(children, ctx);
  return new ExternalHyperlink({
    link: url,
    children: nodes,
  });
};

const buildImage = (
  { url, title: _title, alt: _alt }: mdast.Image,
  images: ImageDataMap
) => {
  const img = images[url];
  invariant(img, `Fetch image was failed: ${url}`);

  const { image, width, height } = img;
  return new ImageRun({
    data: image,
    transformation: {
      width,
      height,
    },
  });
};

const buildFootnoteDefinition = (
  { children }: mdast.FootnoteDefinition,
  ctx: Context
) => {
  return {
    children: children.map((node) => {
      const { nodes } = convertNodes([node], ctx);
      return nodes[0] as Paragraph;
    }),
  };
};

const buildFootnoteReference = ({ identifier }: mdast.FootnoteReference) => {
  // do we need Context?
  return new FootnoteReferenceRun(parseInt(identifier));
};
