"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, Undo2 } from "lucide-react";
import type { FAQ } from "@/types/course.types";

interface FAQManagementProps {
  faqs: FAQ[];
  onFaqsChange: (faqs: FAQ[]) => void;
}

export function FAQManagement({ faqs, onFaqsChange }: FAQManagementProps) {
  const [newFaq, setNewFaq] = useState<FAQ>({ question: "", answer: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [removedFaqStack, setRemovedFaqStack] = useState<
    Array<{ faq: FAQ; index: number }>
  >([]);

  const handleAddFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      return;
    }
    onFaqsChange([...faqs, newFaq]);
    setNewFaq({ question: "", answer: "" });
  };

  const handleDeleteFaq = (index: number) => {
    setRemovedFaqStack((prev) => [...prev, { faq: faqs[index], index }]);
    const updated = faqs.filter((_, i) => i !== index);
    onFaqsChange(updated);
  };

  const handleUndoDeleteFaq = () => {
    const last = removedFaqStack[removedFaqStack.length - 1];
    if (!last) return;
    const next = [...faqs];
    const insertAt = Math.min(last.index, next.length);
    next.splice(insertAt, 0, last.faq);
    onFaqsChange(next);
    setRemovedFaqStack((prev) => prev.slice(0, -1));
  };

  const handleEditFaq = (index: number) => {
    setEditingIndex(index);
  };

  const handleUpdateFaq = (index: number) => {
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Add New FAQ Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                value={newFaq.question}
                onChange={(e) =>
                  setNewFaq({ ...newFaq, question: e.target.value })
                }
                placeholder="Enter FAQ question"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                value={newFaq.answer}
                onChange={(e) =>
                  setNewFaq({ ...newFaq, answer: e.target.value })
                }
                placeholder="Enter FAQ answer"
                rows={4}
              />
            </div>

            <Button type="button" onClick={handleAddFaq}>
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQs List */}
      {faqs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">FAQs List</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndoDeleteFaq}
              disabled={removedFaqStack.length === 0}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
          </div>
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                {editingIndex === index ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const updated = faqs.map((f, i) =>
                            i === index ? { ...f, question: e.target.value } : f
                          );
                          onFaqsChange(updated);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Answer</Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const updated = faqs.map((f, i) =>
                            i === index ? { ...f, answer: e.target.value } : f
                          );
                          onFaqsChange(updated);
                        }}
                        rows={4}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleUpdateFaq(index)}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Question:</h4>
                      <p className="text-muted-foreground">{faq.question}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold">Answer:</h4>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleEditFaq(index)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDeleteFaq(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
