"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createTextNode,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode } from "lexical";
import { $createHeadingNode, HeadingTagType } from "@lexical/rich-text";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { TOGGLE_LINK_COMMAND, $createLinkNode } from "@lexical/link";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Sigma,
  Link,
  Image,
  Code,
  Code2,
} from "lucide-react";
import { insertLaTeXEquation } from "@/lib/editors/latex-plugin";
import { uploadImageToS3 } from "@/lib/s3-upload";
import { toast } from "sonner";

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: "bold" | "italic" | "underline") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (headingSize: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () =>
          $createHeadingNode(headingSize as HeadingTagType)
        );
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const insertList = (listType: "bullet" | "number") => {
    editor.dispatchCommand(
      listType === "bullet"
        ? INSERT_UNORDERED_LIST_COMMAND
        : INSERT_ORDERED_LIST_COMMAND,
      undefined
    );
  };

  const removeList = () => {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  const insertCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode(""));
      } else if (selection) {
        // Insert new code block at cursor
        const codeNode = $createCodeNode("");
        selection.insertNodes([codeNode]);
      }
    });
  };

  const insertInlineCode = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (!url?.trim()) return;

    const trimmedUrl = url.trim();

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (!selection.isCollapsed()) {
        // Wrap selected text in a real LinkNode (serializes to <a href="...">)
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, trimmedUrl);
        return;
      }

      // No selection: insert a new link node with optional link text
      const linkText =
        prompt("Enter link text (optional, leave empty to use URL):")?.trim() ||
        trimmedUrl;
      const linkNode = $createLinkNode(trimmedUrl, {
        target: "_blank",
        rel: "noopener noreferrer",
      });
      linkNode.append($createTextNode(linkText));
      selection.insertNodes([linkNode]);
    });
  };

  const insertImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const loadingToast = toast.loading("Uploading image...");
        const imageUrl = await uploadImageToS3(file, {
          purpose: "announcement-attachment",
        });
        toast.dismiss(loadingToast);
        toast.success("Image uploaded!");

        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Insert image as markdown
            const altText = prompt("Enter alt text (optional):") || "Image";
            selection.insertText(`![${altText}](${imageUrl})`);
          }
        });
      } catch (error) {
        toast.error("Failed to upload image");
        console.error("Image upload error:", error);
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText("bold")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText("italic")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText("underline")}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading("h1")}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading("h2")}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading("h3")}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatParagraph}
        title="Paragraph"
      >
        P
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertList("bullet")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertList("number")}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertInlineCode}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertCodeBlock}
        title="Code Block"
      >
        <Code2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertLink}
        title="Insert Link"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertImage}
        title="Insert Image"
      >
        <Image className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          const latex = prompt(
            "Enter LaTeX equation (e.g., x^2 + 5x + 6 = 0):"
          );
          if (latex) {
            insertLaTeXEquation(editor, latex, false);
          }
        }}
        title="Insert Inline Equation"
      >
        <Sigma className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          const latex = prompt("Enter LaTeX equation (block):");
          if (latex) {
            insertLaTeXEquation(editor, latex, true);
          }
        }}
        title="Insert Block Equation"
      >
        <span className="text-xs font-mono">$$</span>
      </Button>
    </div>
  );
}
