import { EditorThemeClasses } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";

/**
 * Lexical Editor Configuration
 * Base setup for rich text editing with LaTeX/Markdown support
 */

export const editorTheme: EditorThemeClasses = {
  // Base styles
  root: "lexical-editor-root prose prose-sm max-w-none focus:outline-none",
  text: {
    base: "text-foreground",
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-muted px-1 py-0.5 rounded font-mono text-sm",
  },
  heading: {
    h1: "text-3xl font-bold mt-6 mb-4",
    h2: "text-2xl font-bold mt-5 mb-3",
    h3: "text-xl font-bold mt-4 mb-2",
  },
  list: {
    nested: {
      listitem: "ml-4",
    },
    ol: "list-decimal ml-6",
    ul: "list-disc ml-6",
    listitem: "my-1",
  },
  link: "text-primary underline cursor-pointer",
  quote: "border-l-4 border-muted-foreground pl-4 italic my-4",
  code: "bg-muted p-4 rounded-lg font-mono text-sm my-4 block overflow-x-auto",
};

export const initialConfig = {
  namespace: "CourseEditor",
  theme: editorTheme,
  onError: (error: Error) => {
    console.error("Lexical editor error:", error);
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

/**
 * Lexical editor nodes configuration
 * Includes all necessary nodes for rich text editing
 */
export const lexicalNodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
];
