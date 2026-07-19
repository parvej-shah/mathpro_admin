"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { stripMathDelimiters } from "@/lib/editors/latex-plugin";

interface LaTeXEquationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayMode: boolean;
  onConfirm: (latex: string) => void;
}

interface SymbolButton {
  label: string;
  snippet: string;
  // Cursor offset from the start of the inserted snippet, for placing the
  // caret inside the first {} group instead of after the whole snippet.
  cursorOffset: number;
}

const SYMBOL_PALETTE: SymbolButton[] = [
  { label: "x/y", snippet: "\\frac{}{}", cursorOffset: 6 },
  { label: "xⁿ", snippet: "^{}", cursorOffset: 2 },
  { label: "xₙ", snippet: "_{}", cursorOffset: 2 },
  { label: "√x", snippet: "\\sqrt{}", cursorOffset: 6 },
  { label: "α", snippet: "\\alpha", cursorOffset: 6 },
  { label: "β", snippet: "\\beta", cursorOffset: 5 },
  { label: "π", snippet: "\\pi", cursorOffset: 3 },
  { label: "θ", snippet: "\\theta", cursorOffset: 6 },
  { label: "λ", snippet: "\\lambda", cursorOffset: 7 },
  { label: "≤", snippet: "\\leq", cursorOffset: 4 },
  { label: "≥", snippet: "\\geq", cursorOffset: 4 },
  { label: "≠", snippet: "\\neq", cursorOffset: 4 },
  { label: "∞", snippet: "\\infty", cursorOffset: 6 },
  { label: "±", snippet: "\\pm", cursorOffset: 3 },
  { label: "×", snippet: "\\times", cursorOffset: 6 },
  { label: "÷", snippet: "\\div", cursorOffset: 4 },
];

export function LaTeXEquationDialog({
  open,
  onOpenChange,
  displayMode,
  onConfirm,
}: LaTeXEquationDialogProps) {
  const [latex, setLatex] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setLatex("");
    }
  }, [open]);

  // Pasted LLM output often already carries $…$ / \[…\] delimiters; preview the
  // same normalized string that will be inserted.
  const normalized = useMemo(() => stripMathDelimiters(latex), [latex]);

  const { html, error } = useMemo(() => {
    if (!normalized.trim()) {
      return { html: "", error: null as string | null };
    }
    try {
      const rendered = katex.renderToString(normalized, {
        throwOnError: true,
        displayMode,
      });
      return { html: rendered, error: null as string | null };
    } catch (e) {
      return {
        html: "",
        error: e instanceof Error ? e.message : "Invalid LaTeX",
      };
    }
  }, [normalized, displayMode]);

  const insertSnippet = (symbol: SymbolButton) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? latex.length;
    const end = textarea?.selectionEnd ?? latex.length;
    const next = latex.slice(0, start) + symbol.snippet + latex.slice(end);
    setLatex(next);

    const caretPos = start + symbol.cursorOffset;
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(caretPos, caretPos);
    });
  };

  const handleConfirm = () => {
    if (!normalized.trim()) return;
    onConfirm(normalized);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-background/95 text-foreground shadow-2xl sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>
            {displayMode ? "Insert Block Equation" : "Insert Inline Equation"}
          </DialogTitle>
          <DialogDescription>
            Write a LaTeX expression and see it rendered live before inserting.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1">
          {SYMBOL_PALETTE.map((symbol) => (
            <Button
              key={symbol.label}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 min-w-8 px-2 font-serif"
              onClick={() => insertSnippet(symbol)}
              title={symbol.snippet}
            >
              {symbol.label}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="latex-equation-input"
            className="text-sm font-medium text-foreground"
          >
            LaTeX
          </label>
          <Textarea
            id="latex-equation-input"
            ref={textareaRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            placeholder="e.g. x^2 + 5x + 6 = 0"
            className="font-mono"
            rows={3}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Preview</p>
          <div className="min-h-16 rounded-md border border-input bg-muted/30 p-3 overflow-x-auto">
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Preview will appear here
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!normalized.trim() || !!error}
          >
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
