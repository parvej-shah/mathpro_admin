"use client";

import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { uploadImageToS3 } from "@/lib/s3-upload";
import { toast } from "sonner";
import { CalendarIcon, Copy, ImageUp, Loader2, Wrench } from "lucide-react";

function copyToClipboard(text: string, successText: string) {
  if (!text) return;
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(successText))
    .catch(() => toast.error("Failed to copy"));
}

export function CourseHeaderHelpers() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeValue, setTimeValue] = useState("00:00:00");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeTime = (raw: string): string | null => {
    const value = raw.trim();
    if (!value) return null;

    const parts = value.split(":");
    if (parts.length > 3) return null;

    const [h = "0", m = "0", s = "0"] = parts;
    if (
      !/^\d{1,2}$/.test(h) ||
      !/^\d{1,2}$/.test(m) ||
      !/^\d{1,2}$/.test(s)
    ) {
      return null;
    }

    const hh = Number(h);
    const mm = Number(m);
    const ss = Number(s);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
      return null;
    }

    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const formattedDateTime = useMemo(() => {
    if (!selectedDate) return "";
    const datePart = format(selectedDate, "yyyy-MM-dd");
    const safeTime = normalizeTime(timeValue) || "00:00:00";
    return `${datePart}T${safeTime}+06:00`;
  }, [selectedDate, timeValue]);

  const handleImageFile = async (file: File) => {
    try {
      setIsUploading(true);
      const timestamp = Date.now();
      const fileName = `courses/helpers/${timestamp}_${file.name}`;
      const renamedFile = new File([file], fileName, {
        type: file.type,
        lastModified: file.lastModified,
      });
      const uploaded = await uploadImageToS3(renamedFile, {
        purpose: "course-thumbnail",
      });
      setImageUrl(uploaded);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Wrench className="mr-2 h-4 w-4" />
          Helper Tools
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Course Helper Tools</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Date Format Helper</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="helper-time">Time (`HH:mm:ss`)</Label>
                <Input
                  id="helper-time"
                  type="time"
                  step={1}
                  value={timeValue}
                  onChange={(e) => {
                    const next = e.target.value;
                    // Browser time input can emit HH:mm; keep seconds explicit.
                    const normalized = normalizeTime(next);
                    setTimeValue(normalized || next);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Formatted Output</Label>
                <div className="flex gap-2">
                  <Input readOnly value={formattedDateTime} placeholder="Select date first" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(
                        formattedDateTime,
                        "Formatted date copied"
                      )
                    }
                    disabled={!formattedDateTime}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Image Upload Helper</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageUp className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <Label>Uploaded URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value={imageUrl} placeholder="Upload image to get URL" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(imageUrl, "Image URL copied")
                    }
                    disabled={!imageUrl}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
