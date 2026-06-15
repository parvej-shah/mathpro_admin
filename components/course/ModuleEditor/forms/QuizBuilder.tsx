"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LexicalEditor } from "@/components/announcements/LexicalEditor";
import { extractTextFromHTML } from "@/lib/editors/latex-plugin";
import { sanitizeHtmlContent } from "@/lib/helpers";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export interface QuizQuestion {
  id: string;
  question: string;
  question_html: string;
  options: string[]; // Plain text options (for backward compatibility)
  options_html: string[]; // Rich text HTML options
  correct_answer: string;
  explanation: string;
  explanation_html: string;
  points: number;
}

interface QuizBuilderProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

/**
 * Quiz Builder Component
 * Full GUI for building quiz questions with drag-and-drop reordering
 */
export function QuizBuilder({ questions, onChange }: QuizBuilderProps) {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    questions.length > 0 ? questions[0].id : null
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeQuestion = questions.find((q) => q.id === activeQuestionId);

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      question: "",
      question_html: "",
      options: ["", "", "", ""],
      options_html: ["", "", "", ""],
      correct_answer: "",
      explanation: "",
      explanation_html: "",
      points: 1,
    };
    onChange([...questions, newQuestion]);
    setActiveQuestionId(newQuestion.id);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const newQuestions = questions.filter((q) => q.id !== questionId);
    onChange(newQuestions);
    if (activeQuestionId === questionId) {
      setActiveQuestionId(newQuestions.length > 0 ? newQuestions[0].id : null);
    }
  };

  const handleUpdateQuestion = (
    questionId: string,
    updates: Partial<QuizQuestion>
  ) => {
    onChange(
      questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const handleAddOption = (questionId: string) => {
    handleUpdateQuestion(questionId, {
      options: [...(activeQuestion?.options || []), ""],
      options_html: [...(activeQuestion?.options_html || []), ""],
    });
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    if (activeQuestion && activeQuestion.options.length > 2) {
      const newOptions = activeQuestion.options.filter(
        (_, i) => i !== optionIndex
      );
      const newOptionsHtml = activeQuestion.options_html.filter(
        (_, i) => i !== optionIndex
      );
      handleUpdateQuestion(questionId, {
        options: newOptions,
        options_html: newOptionsHtml,
        // Clear correct answer if it was the removed option
        correct_answer:
          activeQuestion.correct_answer === activeQuestion.options[optionIndex]
            ? ""
            : activeQuestion.correct_answer,
      });
    } else {
      toast.error("Quiz questions must have at least 2 options");
    }
  };

  const handleUpdateOption = (
    questionId: string,
    optionIndex: number,
    html: string,
    text: string
  ) => {
    if (activeQuestion) {
      const newOptions = [...activeQuestion.options];
      const newOptionsHtml = [...activeQuestion.options_html];
      newOptions[optionIndex] = text;
      newOptionsHtml[optionIndex] = html;
      handleUpdateQuestion(questionId, {
        options: newOptions,
        options_html: newOptionsHtml,
        // Update correct answer if it was this option
        correct_answer:
          activeQuestion.correct_answer === activeQuestion.options[optionIndex]
            ? text
            : activeQuestion.correct_answer,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      onChange(arrayMove(questions, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      {/* Questions List Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="flex items-center justify-between mb-2 sticky top-0 bg-background z-10 pb-2">
            <Label className="text-base font-semibold">
              Questions ({questions.length})
            </Label>
            <Button
              type="button"
              size="sm"
              onClick={handleAddQuestion}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    index={index}
                    isActive={activeQuestionId === question.id}
                    onClick={() => setActiveQuestionId(question.id)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Question Editor */}
        <div className="lg:col-span-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {activeQuestion ? (
            <QuestionEditor
              key={activeQuestion.id} // IMPORTANT: Force remount when switching questions
              question={activeQuestion}
              onUpdate={(updates) =>
                handleUpdateQuestion(activeQuestion.id, updates)
              }
              onAddOption={() => handleAddOption(activeQuestion.id)}
              onRemoveOption={(index) =>
                handleRemoveOption(activeQuestion.id, index)
              }
              onUpdateOption={(index, html, text) =>
                handleUpdateOption(activeQuestion.id, index, html, text)
              }
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No questions yet. Click "Add Question" to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Question Item in Sidebar (Sortable)
 */
function QuestionItem({
  question,
  index,
  isActive,
  onClick,
  onDelete,
}: {
  question: QuizQuestion;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all ${
        isActive ? "border-primary border-2 bg-primary/5" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">Q{index + 1}</Badge>
              <Badge variant="secondary">{question.points} pts</Badge>
            </div>
            <p className="text-sm font-medium line-clamp-2">
              {question.question || "Untitled Question"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {question.options.filter((o) => o.trim()).length} options
              {question.correct_answer && (
                <span className="ml-2 text-success">✓ Answered</span>
              )}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Helper: Check if an option is the correct answer
 * Uses trimmed comparison to handle whitespace differences
 */
function isCorrectOption(correctAnswer: string, option: string): boolean {
  if (!correctAnswer || !option) return false;
  // Compare trimmed values to handle whitespace differences
  return correctAnswer.trim() === option.trim();
}

/**
 * Helper: Find the index of the correct option
 */
function findCorrectOptionIndex(correctAnswer: string, options: string[]): number {
  if (!correctAnswer) return -1;
  return options.findIndex((opt) => isCorrectOption(correctAnswer, opt));
}

/**
 * Question Editor (Right Panel)
 */
function QuestionEditor({
  question,
  onUpdate,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
}: {
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onUpdateOption: (index: number, html: string, text: string) => void;
}) {
  // Local state for Lexical editors - initialized from props
  const [questionHtml, setQuestionHtml] = useState(question.question_html || "");
  const [explanationHtml, setExplanationHtml] = useState(
    question.explanation_html || ""
  );

  // Update local state when question prop changes (for safety, though key should handle this)
  useEffect(() => {
    setQuestionHtml(question.question_html || "");
    setExplanationHtml(question.explanation_html || "");
  }, [question.id, question.question_html, question.explanation_html]);

  // Find which option index is the correct answer
  const correctOptionIndex = findCorrectOptionIndex(question.correct_answer, question.options);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Question</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Text */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Question Text *</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Use rich text formatting, LaTeX equations ($x^2 + 5x + 6 = 0$), and
            all editor features
          </p>
          <LexicalEditor
            key={`question-${question.id}`}
            initialHtml={questionHtml}
            onChange={(html) => {
              setQuestionHtml(html);
              const sanitizedHtml = sanitizeHtmlContent(html);
              onUpdate({
                question_html: sanitizedHtml,
                question: sanitizedHtml ? extractTextFromHTML(html) : "",
              });
            }}
            onTextChange={() => {}}
            placeholder="Enter question text (supports LaTeX: $x^2 + 5x + 6 = 0$)"
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Options *</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAddOption}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>
          <div className="space-y-4">
            {question.options.map((option, index) => {
              // Check if this option is the correct answer (by index or value match)
              const isCorrect = index === correctOptionIndex || isCorrectOption(question.correct_answer, option);
              
              return (
                <Card
                  key={`${question.id}-option-${index}`}
                  className={`p-4 ${
                    isCorrect
                      ? "border-primary border-2 bg-primary/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-2">
                      <input
                        type="radio"
                        name={`correct_answer_${question.id}`}
                        checked={isCorrect}
                        onChange={() => onUpdate({ correct_answer: option })}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Option {index + 1}
                        {isCorrect && (
                          <Badge variant="default" className="ml-2">
                            Correct Answer
                          </Badge>
                        )}
                      </Label>
                      <LexicalEditor
                        key={`${question.id}-option-editor-${index}`}
                        initialHtml={question.options_html[index] || option || ""}
                        onChange={(html) => {
                          const sanitizedHtml = sanitizeHtmlContent(html);
                          const text = sanitizedHtml ? extractTextFromHTML(html) : "";
                          onUpdateOption(index, sanitizedHtml, text);
                        }}
                        onTextChange={() => {}}
                        placeholder={`Enter option ${index + 1} text (supports LaTeX and rich text)`}
                      />
                    </div>
                    {question.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveOption(index)}
                        className="mt-2"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          {correctOptionIndex === -1 && !question.correct_answer && (
            <p className="text-sm text-destructive">
              Please select the correct answer
            </p>
          )}
        </div>

        {/* Points */}
        <div className="space-y-2">
          <Label htmlFor={`points-${question.id}`}>Points *</Label>
          <Input
            id={`points-${question.id}`}
            type="number"
            min="1"
            value={question.points}
            onChange={(e) =>
              onUpdate({ points: parseInt(e.target.value) || 1 })
            }
          />
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            Explanation (Optional)
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Provide detailed explanation with rich text and LaTeX support
          </p>
          <LexicalEditor
            key={`explanation-${question.id}`}
            initialHtml={explanationHtml}
            onChange={(html) => {
              setExplanationHtml(html);
              const sanitizedHtml = sanitizeHtmlContent(html);
              onUpdate({
                explanation_html: sanitizedHtml,
                explanation: sanitizedHtml ? extractTextFromHTML(html) : "",
              });
            }}
            onTextChange={() => {}}
            placeholder="Enter explanation (supports LaTeX and rich text)"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// extractTextFromHTML is imported from latex-plugin
