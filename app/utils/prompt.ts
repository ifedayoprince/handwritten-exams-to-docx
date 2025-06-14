export const USER_PROMPT = `Extract all the text from these images and format them as Markdown.
Here are some rules to follow in your formatting:
- For mathematical equations that cannot be written in normal text, write it in LaTeX syntax. 
  - Remember to wrap it in '$' (single dollar sign) for inline math (e.g. $x = 5$)
- For tables, indicate it with "[TABLE]".
- If there are any diagrams or graphics that cannot be transcribed, indicate with "[GRAPHIC]".
- When adding the options in the question, mark them as a list with "-", but do not include their number/letter in the document.
    E.g., don't do "- (a) An animal" or "- (b) A plant", just do "- An animal" or "- A plant"
- In fill-in-the-blank questions, indicate the blank with 5 underscores ("_____").
    E.g., "_____ named Nigeria"
- Preserve the original formatting of the document as much as possible.
- Correct clear typographical or accidental errors in spelling or grammar, but preserve any content that appears intentionally altered to test students' understanding.
- Handle questions and options that span multiple pages by recognizing incomplete text and ensuring each question is fully assembled before formatting.
- Do not add a period at the end of the phrases in the section b, but add a question mark to clear questions.
- Employ proper grammar rules e.g. capitalize the first letter of all proper nouns.

Most importantly, start your output right away, NEVER say anything else before or after it

Here is an example format we expect from you:

**Section A: Objectives**

1. What is a dog?
  - An animal
  - A plant
  - A name of a person
  - None of the above

[GRAPHIC]
2. From the diagram above, _____ is the capital of France.
  - Paris
  - London
  - Rome
  - Madrid

3. Solve for x in $5x = 5$
  - x = 1
  - x = 2
  - x = 3
  - x = 4

**Section B: Theory**

1. (a) List 3 parts of speech in English
   (b) What is the capital of France?
`