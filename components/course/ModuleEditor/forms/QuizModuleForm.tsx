"use client";

import { BaseModuleForm } from "./BaseModuleForm";
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  useUpdateModule,
  useCreateModule,
  useUpdateModuleEnhanced,
} from "@/hooks/useModules";
import { encryptString, decryptString } from "@/lib/auth";
import { useCourseStore } from "@/lib/stores/course-store";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Module, ModuleCategory } from "@/types";
import { QuizBuilder, type QuizQuestion } from "./QuizBuilder";

/**
 * Helper: Safely encrypt a string - returns empty string for empty/whitespace input
 * This prevents encrypting empty explanations into garbage strings
 */
function safeEncrypt(
  text: string | undefined | null,
  secretKey: string
): string {
  if (!text || !text.trim()) return "";
  return encryptString(text, secretKey);
}

/**
 * Helper: Safely decrypt a string - returns empty string on failure
 * This handles loading encrypted data from DB for editing
 */
function safeDecrypt(
  encryptedText: string | undefined | null,
  secretKey: string
): string {
  if (!encryptedText || !encryptedText.trim()) return "";
  try {
    const decrypted = decryptString(encryptedText, secretKey);
    // If decryption returns empty or gibberish, return empty
    // Valid decryption should return readable text
    if (!decrypted) return "";
    return decrypted;
  } catch {
    // Decryption failed - likely not encrypted or corrupted
    return "";
  }
}

/**
 * Helper: Check if a string looks like encrypted data (base64-ish)
 */
function isEncrypted(text: string | undefined | null): boolean {
  if (!text || !text.trim()) return false;
  // Encrypted strings from CryptoJS start with "U2FsdGVk" (base64 of "Salted__")
  return text.startsWith("U2FsdGVk");
}

interface QuizModuleFormProps {
  module?: Module | null;
}

/**
 * Quiz Module Form
 * Enhanced UX with time/attempt limits and JSON import/export
 * Fully implemented with comprehensive QuizBuilder component
 */
export function QuizModuleForm({ module }: QuizModuleFormProps) {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId ? parseInt(params.courseId as string) : 0;
  const { editingModuleId, draftChanges } = useCourseStore();

  const navigateBack = () => router.push(`/courses/${courseId}`);

  const chapterId =
    module?.chapter_id || (draftChanges.chapterId as number) || 0;

  const updateModuleEnhanced = useUpdateModuleEnhanced(
    editingModuleId || 0,
    courseId
  );
  const updateModule = useUpdateModule(
    editingModuleId || 0,
    chapterId,
    courseId
  );
  const createModule = useCreateModule(chapterId, courseId);

  // NEW: Quiz time limit
  const [quizTimeLimit, setQuizTimeLimit] = useState<number | undefined>(
    module?.quiz_time_limit
  );

  // Quiz attempt limit is fixed at 1 (single attempt)
  const quizAttemptLimit = 1;

  // Handle both string (JSON) and object formats for module data
  const getModuleData = (): Record<string, unknown> => {
    if (!module?.data) return {};
    if (typeof module.data === "string") {
      try {
        return JSON.parse(module.data);
      } catch {
        return {};
      }
    }
    return (module.data as Record<string, unknown>) || {};
  };

  // Get secret key for encryption/decryption
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_QUIZ || "";

  /**
   * Parse quiz question from DB format to editor format
   * Handles decryption of answer and explanation fields
   */
  const parseQuizQuestion = (q: any, index: number): QuizQuestion => {
    // Get the encrypted answer (from 'answer' or 'correct_answer' field)
    const encryptedAnswer = q.answer || q.correct_answer || "";

    // Decrypt the answer to get the plain text correct option
    // The answer field contains the encrypted version of the correct option text
    let correctAnswerText = "";
    if (encryptedAnswer && isEncrypted(encryptedAnswer) && secretKey) {
      const decrypted = safeDecrypt(encryptedAnswer, secretKey);
      // Only use if decryption produced valid text (not gibberish/encrypted-looking)
      if (decrypted && !isEncrypted(decrypted)) {
        correctAnswerText = decrypted;
      }
    }

    // Decrypt explanation if it's encrypted
    let explanationText = "";
    let explanationHtmlText = "";

    // Handle explanation field
    if (q.explanation) {
      if (isEncrypted(q.explanation) && secretKey) {
        // Encrypted explanation - try to decrypt
        const decrypted = safeDecrypt(q.explanation, secretKey);
        // Only use if valid decryption (not garbage/still encrypted-looking)
        if (decrypted && !isEncrypted(decrypted)) {
          explanationText = decrypted;
        }
        // If decryption failed or produced garbage, leave empty
      } else if (!isEncrypted(q.explanation)) {
        // Plain text explanation (legacy)
        explanationText = q.explanation;
      }
    }

    // Handle explanation_html field
    if (q.explanation_html) {
      if (isEncrypted(q.explanation_html) && secretKey) {
        // Encrypted explanation_html - try to decrypt
        const decrypted = safeDecrypt(q.explanation_html, secretKey);
        // Only use if valid decryption
        if (decrypted && !isEncrypted(decrypted)) {
          explanationHtmlText = decrypted;
        }
      } else if (!isEncrypted(q.explanation_html)) {
        // Plain text explanation_html (legacy)
        explanationHtmlText = q.explanation_html;
      }
    }

    // If only one explanation exists, use it for both
    if (!explanationHtmlText && explanationText) {
      explanationHtmlText = explanationText;
    }
    if (!explanationText && explanationHtmlText) {
      explanationText = explanationHtmlText;
    }

    // Generate a unique ID for this question
    const uniqueId = `q_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    return {
      id: uniqueId,
      question: q.question || "",
      question_html: q.question_html || q.question || "",
      options: q.options || [],
      options_html: q.options_html || q.options || [],
      correct_answer: correctAnswerText, // DECRYPTED plain text (empty if decryption failed)
      explanation: explanationText, // DECRYPTED plain text (empty if decryption failed)
      explanation_html: explanationHtmlText, // DECRYPTED HTML (empty if decryption failed)
      points: q.points || 1,
    };
  };

  // Quiz questions state - initialize empty, will be populated by useEffect
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Track module ID to detect when we're editing a different module
  const moduleIdRef = useRef<number | null>(module?.id || null);

  // Load quiz questions from module data on mount and when module changes
  // This ensures proper decryption happens after all hooks are initialized
  useEffect(() => {
    const currentModuleId = module?.id || null;

    // If module ID changed, reset all form state
    if (currentModuleId !== moduleIdRef.current) {
      moduleIdRef.current = currentModuleId;

      if (module) {
        const data = getModuleData();
        setQuizTimeLimit(module.quiz_time_limit);

        // Load and decrypt quiz questions
        if ("quiz" in data) {
          const quizData = data.quiz as unknown[];
          if (Array.isArray(quizData) && quizData.length > 0) {
            const parsedQuestions = quizData.map((q: any, index: number) =>
              parseQuizQuestion(q, index)
            );
            setQuizQuestions(parsedQuestions);
          } else {
            setQuizQuestions([]);
          }
        } else {
          setQuizQuestions([]);
        }
      } else {
        // No module - empty state (creating new)
        setQuizTimeLimit(undefined);
        setQuizQuestions([]);
      }
    } else if (module) {
      // Same module, but data might have updated - sync state
      const data = getModuleData();
      setQuizTimeLimit(module.quiz_time_limit);

      // Load and decrypt quiz questions
      if ("quiz" in data) {
        const quizData = data.quiz as unknown[];
        if (Array.isArray(quizData) && quizData.length > 0) {
          const parsedQuestions = quizData.map((q: any, index: number) =>
            parseQuizQuestion(q, index)
          );
          setQuizQuestions(parsedQuestions);
        } else {
          setQuizQuestions([]);
        }
      } else {
        setQuizQuestions([]);
      }
    } else {
      // No module - empty state (creating new)
      setQuizTimeLimit(undefined);
      setQuizQuestions([]);
    }
  }, [module, secretKey]);

  const handleSubmit = async (data: Partial<Module>) => {
    try {
      // Validate quiz questions
      if (quizQuestions.length === 0) {
        toast.error("Please add at least one quiz question");
        return;
      }

      // Validate all questions have correct answers
      const invalidQuestions = quizQuestions.filter(
        (q) => !q.correct_answer || !q.question.trim()
      );
      if (invalidQuestions.length > 0) {
        toast.error(
          "Please ensure all questions have text and a correct answer selected"
        );
        return;
      }

      // Encrypt answers and explanations
      if (!secretKey) {
        toast.error("Quiz encryption key not configured");
        return;
      }

      const encryptedQuestions = quizQuestions.map((q) => {
        // Always encrypt the correct answer (required field)
        const encryptedAnswer = encryptString(q.correct_answer, secretKey);

        // Only encrypt explanation if it has content (use safeEncrypt)
        // This prevents empty explanations from becoming encrypted garbage
        const encryptedExplanation = safeEncrypt(q.explanation, secretKey);
        const encryptedExplanationHtml = safeEncrypt(
          q.explanation_html,
          secretKey
        );

        return {
          question: q.question,
          question_html: q.question_html,
          options: q.options,
          options_html: q.options_html || q.options, // Include HTML options
          answer: encryptedAnswer, // LEGACY field (required for user-frontend compatibility)
          correct_answer: encryptedAnswer, // NEW field (for forward compatibility)
          explanation: encryptedExplanation, // Empty string if no explanation
          explanation_html: encryptedExplanationHtml, // Empty string if no explanation
          points: q.points,
        };
      });

      // Get category from draft (allows type changes)
      const category =
        (draftChanges.moduleType as ModuleCategory) ||
        module?.category ||
        "QUIZ";

      // Prepare metadata for quiz data structure
      const quizMetadata: {
        time_limit?: number;
        attempt_limit?: number;
      } = {};
      if (quizTimeLimit !== undefined) {
        quizMetadata.time_limit = quizTimeLimit;
      }
      if (quizAttemptLimit !== undefined) {
        quizMetadata.attempt_limit = quizAttemptLimit;
      }

      // OLD PATTERN (required for student frontend compatibility)
      // Include metadata in quiz data structure (for consistency with import)
      const moduleDataPayload = {
        answer: "",
        options: [],
        category: category,
        quiz: encryptedQuestions,
        // Include metadata in quiz data structure
        ...(Object.keys(quizMetadata).length > 0 && { metadata: quizMetadata }),
      };

      if (editingModuleId && module) {
        // Use v2 enhanced API for updates
        // data.description comes from BaseModuleForm
        await updateModuleEnhanced.mutateAsync({
          ...data,
          category: category as ModuleCategory,
          quiz_time_limit: quizTimeLimit,
          quiz_attempt_limit: quizAttemptLimit,
          data: moduleDataPayload,
        });
        navigateBack();
      } else if (chapterId) {
        // data.description comes from BaseModuleForm
        await createModule.mutateAsync({
          title: data.title || "Untitled Quiz Module",
          description: data.description || "",
          category: category as ModuleCategory,
          serial: 1,
          score: data.score || 0,
          is_live: data.is_live || false,
          is_free: data.is_free || false,
          quiz_time_limit: quizTimeLimit,
          quiz_attempt_limit: quizAttemptLimit,
          data: moduleDataPayload,
        });
        navigateBack();
        useCourseStore.getState().clearDraft();
      } else {
        toast.error("Chapter ID is required");
      }
    } catch (error) {
      toast.error("Failed to save quiz module");
    }
  };

  return (
    <BaseModuleForm
      module={module}
      onSubmit={handleSubmit}
      onCancel={navigateBack}
    >
      <div className="space-y-4">
        {/* NEW: Quiz Time Limit */}
        <div className="space-y-2">
          <Label htmlFor="quiz-time-limit">
            Quiz Time Limit (minutes, optional)
          </Label>
          <Input
            id="quiz-time-limit"
            type="number"
            min="0"
            value={quizTimeLimit || ""}
            onChange={(e) =>
              setQuizTimeLimit(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            placeholder="No time limit"
          />
        </div>

        {/* Quiz Questions Builder */}
        <div className="border-t pt-4">
          <Label className="text-base font-semibold mb-4 block sticky -top-4 bg-background z-20 py-2">
            Quiz Questions
          </Label>
          <QuizBuilder questions={quizQuestions} onChange={setQuizQuestions} />
        </div>
      </div>
    </BaseModuleForm>
  );
}
