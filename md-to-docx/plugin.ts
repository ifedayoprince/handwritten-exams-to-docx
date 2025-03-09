import type { Plugin } from "unified";
import type * as mdast from "mdast";
import { visit } from "unist-util-visit";
import { mdastToDocx, DocxOptions, ImageDataMap } from "./transformer";
import { invariant } from "./utils";

export type { DocxOptions };

const plugin: Plugin<[DocxOptions?]> = function (opts: Partial<DocxOptions> = {}) {
  let images: ImageDataMap = {};

  this.Compiler = (node) => {
    return mdastToDocx(node as any, opts as DocxOptions, images);
  };

  return async (node) => {
    const imageList: mdast.Image[] = [];
    visit(node, "image", (node) => {
      imageList.push(node);
    });
    if (imageList.length === 0) {
      return node;
    }

    const imageResolver = opts.imageResolver;
    invariant(imageResolver, "options.imageResolver is not defined.");

    const imageDatas = await Promise.all(
      imageList.map(({ url }) => imageResolver(url))
    );
    images = imageList.reduce((acc, img, i) => {
      acc[img.url] = imageDatas[i]!;
      return acc;
    }, {} as ImageDataMap);
    return node;
  };
};
export default plugin;
