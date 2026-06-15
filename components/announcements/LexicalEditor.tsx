"use client";

import { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $getRoot, $insertNodes, EditorState } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getSelection, $isRangeSelection } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $isTextNode,
  $isLineBreakNode,
  $isElementNode,
} from "lexical";
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { ToolbarPlugin } from "./LexicalToolbar";
import { LaTeXPlugin } from "@/lib/editors/latex-plugin";
import { MarkdownPastePlugin } from "@/lib/editors/markdown-paste-plugin";

const theme = {
  paragraph: "mb-2",
  heading: {
    h1: "text-3xl font-bold mb-4",
    h2: "text-2xl font-bold mb-3",
    h3: "text-xl font-bold mb-2",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "font-mono bg-muted px-1 rounded",
  },
  list: {
    ul: "list-disc pl-6 mb-2",
    ol: "list-decimal pl-6 mb-2",
  },
  quote: "border-l-4 border-muted-foreground pl-4 italic my-2",
  code: "bg-muted p-4 rounded font-mono text-sm block overflow-x-auto",
};

function OnChange({
  onChange,
  onTextChange,
}: {
  onChange: (html: string) => void;
  onTextChange?: (text: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onChange(htmlString);

        if (onTextChange) {
          const root = $getRoot();
          onTextChange(root.getTextContent());
        }
      });
    });
  }, [editor, onChange, onTextChange]);

  return null;
}

interface LexicalEditorProps {
  initialHtml?: string;
  onChange: (html: string) => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
}

const initialConfig = {
  namespace: "AnnouncementEditor",
  theme,
  onError: (error: Error) => {
    console.error("Lexical error:", error);
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

export function LexicalEditor({
  initialHtml,
  onChange,
  onTextChange,
  placeholder = "Enter announcement description...",
}: LexicalEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-[200px] border rounded-md p-4 bg-muted animate-pulse" />
    );
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded-md overflow-hidden">
        <ToolbarPlugin />
        <div className="relative min-h-[200px] bg-background">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="outline-none p-4 min-h-[200px] prose prose-sm max-w-none" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary as any}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <MarkdownPastePlugin />
          <LaTeXPlugin />
          <OnChange onChange={onChange} onTextChange={onTextChange} />
          {initialHtml && <InitialContentPlugin html={initialHtml} />}
        </div>
      </div>
    </LexicalComposer>
  );
}

function InitialContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && html) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        // Handle empty or whitespace-only HTML
        if (
          !html ||
          !html.trim() ||
          html.trim() === "<p></p>" ||
          html.trim() === "<p><br></p>"
        ) {
          // Just create an empty paragraph
          root.append($createParagraphNode());
          setIsInitialized(true);
          return;
        }

        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);

        // Filter and wrap nodes to ensure only valid element nodes are inserted
        const validNodes = nodes
          .map((node) => {
            // Filter out line breaks
            if ($isLineBreakNode(node)) {
              return null;
            }

            // Wrap text nodes in paragraphs
            if ($isTextNode(node)) {
              const text = node.getTextContent();
              if (text.trim() === "") {
                return null; // Skip empty text nodes
              }
              return $createParagraphNode().append(node);
            }

            // Only element nodes can be inserted directly into root
            if ($isElementNode(node)) {
              return node;
            }

            // For any other node type, wrap in paragraph
            return $createParagraphNode().append(node);
          })
          .filter((node) => node !== null);

        // Only append if we have valid nodes
        if (validNodes.length > 0) {
          root.append(...validNodes);
        } else {
          // If no valid nodes, create empty paragraph
          root.append($createParagraphNode());
        }
      });
      setIsInitialized(true);
    }
  }, [editor, html, isInitialized]);

  return null;
}
