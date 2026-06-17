"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  useUpdateTeacher,
  useCreateTeacher,
  useUploadTeacherImage,
} from "@/hooks/useTeachers";
import { useCourses } from "@/hooks/useAnnouncements";
import type { Course } from "@/hooks/useAnnouncements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faGraduationCap,
  faPhone,
  faPlus,
  faTrash,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import type {
  Teacher,
  UpdateTeacherData,
  CreateTeacherData,
} from "@/services/teacher.service";
import { toast } from "sonner";

interface TeacherFormProps {
  teacher?: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TeacherForm({
  teacher,
  isOpen,
  onClose,
  onSuccess,
}: TeacherFormProps) {
  const isEditMode = !!teacher;
  const [formData, setFormData] = useState({
    name: "",
    login: "",
    role: "",
    university: "",
    credibility: "",
    image: "",
    achievements: [] as string[],
    social: {
      facebook: "",
      linkedin: "",
      twitter: "",
      github: "",
    },
    courses_teaching: [] as number[],
    isActive: true,
    isPrivileged: false, // CRITICAL: Controls admin panel access
  });
  const [newAchievement, setNewAchievement] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: coursesData } = useCourses();
  const updateTeacher = useUpdateTeacher();
  const createTeacher = useCreateTeacher();
  const uploadImage = useUploadTeacherImage();

  const courses: Course[] = (() => {
    if (!coursesData?.data) return [];
    const responseData = coursesData.data as Course[] | { data?: Course[] };
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  useEffect(() => {
    if (!isOpen) {
      // Reset form
      setFormData({
        name: "",
        login: "",
        role: "",
        university: "",
        credibility: "",
        image: "",
        achievements: [],
        social: {
          facebook: "",
          linkedin: "",
          twitter: "",
          github: "",
        },
        courses_teaching: [],
        isActive: true,
        isPrivileged: false,
      });
      setNewAchievement("");
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (teacher) {
      // Populate form from teacher data
      setFormData({
        name: teacher.name || "",
        login: teacher.login || "",
        role: teacher.role || "",
        university: teacher.university || "",
        credibility: teacher.bio || "",
        image: teacher.image || "",
        achievements: teacher.achievements || [],
        social: {
          facebook: teacher.social?.facebook || "",
          linkedin: teacher.social?.linkedin || "",
          twitter: teacher.social?.twitter || "",
          github: teacher.social?.github || "",
        },
        courses_teaching: teacher.courses_teaching || [],
        isActive: teacher.isActive !== undefined ? teacher.isActive : true,
        isPrivileged:
          teacher.isPrivileged !== undefined ? teacher.isPrivileged : false,
      });
      setImagePreview(teacher.image || "");
    }
  }, [teacher, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof window === "undefined") return;

    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()],
      }));
      setNewAchievement("");
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  const toggleCourse = (courseId: number) => {
    setFormData((prev) => ({
      ...prev,
      courses_teaching: prev.courses_teaching.includes(courseId)
        ? prev.courses_teaching.filter((id) => id !== courseId)
        : [...prev.courses_teaching, courseId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUploading(true);
    try {
      let imageUrl = formData.image;

      // Upload image if new file selected
      if (imageFile && isEditMode && teacher) {
        const uploadResult = await uploadImage.mutateAsync({
          id: teacher.id,
          imageFile,
        });
        imageUrl = uploadResult.data?.image || imageUrl;
      } else if (imageFile && !isEditMode) {
        // For new teachers, we'll upload after creation
        // For now, we'll use the image field in the form
        // TODO: Handle image upload for new teachers
      }

      const teacherData: CreateTeacherData | UpdateTeacherData = {
        name: formData.name,
        login: formData.login,
        role: formData.role || undefined,
        university: formData.university || undefined,
        bio: formData.credibility || undefined,
        image: imageUrl || undefined,
        achievements:
          formData.achievements.length > 0 ? formData.achievements : undefined,
        social: Object.values(formData.social).some((v) => v.trim())
          ? {
              ...(formData.social.facebook && {
                facebook: formData.social.facebook,
              }),
              ...(formData.social.linkedin && {
                linkedin: formData.social.linkedin,
              }),
              ...(formData.social.twitter && {
                twitter: formData.social.twitter,
              }),
              ...(formData.social.github && { github: formData.social.github }),
            }
          : undefined,
        courses_teaching:
          formData.courses_teaching.length > 0
            ? formData.courses_teaching
            : undefined,
        isActive: formData.isActive,
        isPrivileged: formData.isPrivileged, // CRITICAL FLAG
      };

      if (isEditMode && teacher) {
        await updateTeacher.mutateAsync({
          id: teacher.id,
          data: teacherData as UpdateTeacherData,
        });
      } else {
        const result = await createTeacher.mutateAsync(
          teacherData as CreateTeacherData
        );

        // Upload image for new teacher if needed
        if (imageFile && result.data?.id) {
          await uploadImage.mutateAsync({
            id: result.data.id,
            imageFile,
          });
        }
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} teacher:`,
        error
      );
      // Error handling is done in the mutation hooks (useCreateTeacher/useUpdateTeacher)
      // This catch block is just for logging and cleanup
      // The toast error will be shown by the hook's onError handler
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Teacher Profile" : "Create New Teacher"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update teacher information and course assignments"
              : "Add a new teacher to the system. Use 'Grant Admin Access' to give them admin panel credentials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              {imagePreview && imagePreview.trim() !== "" && (
                <AvatarImage
                  src={imagePreview}
                  alt={teacher?.name || "Teacher"}
                />
              )}
              <AvatarFallback className="text-2xl">
                {formData.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "T"}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <FontAwesomeIcon icon={faImage} className="mr-2 h-4 w-4" />
              {isEditMode ? "Change Photo" : "Upload Photo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login">
                Phone/Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="login"
                value={formData.login}
                onChange={(e) =>
                  setFormData({ ...formData, login: e.target.value })
                }
                placeholder="e.g., 01712345678 or email@example.com"
                disabled={isEditMode}
                className={isEditMode ? "bg-muted" : ""}
                required={!isEditMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="e.g., Instructor at Math Pro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                placeholder="e.g., BUET"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="credibility">Credibility</Label>
              <Textarea
                id="credibility"
                value={formData.credibility}
                onChange={(e) =>
                  setFormData({ ...formData, credibility: e.target.value })
                }
                rows={3}
                placeholder="Shown in the public teacher section"
              />
            </div>
          </div>

          <Separator />

          {/* Achievements */}
          <div className="space-y-3">
            <Label>Achievements</Label>
            <div className="flex gap-2">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Add achievement..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAchievement();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAchievement}
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <span className="text-sm">{achievement}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAchievement(index)}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="h-4 w-4 text-destructive"
                    />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Social Links */}
          <div className="space-y-3">
            <Label>Social Links</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  type="url"
                  value={formData.social.facebook}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, facebook: e.target.value },
                    })
                  }
                  placeholder="https://www.facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.social.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://www.linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  type="url"
                  value={formData.social.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, twitter: e.target.value },
                    })
                  }
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  type="url"
                  value={formData.social.github}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social: { ...formData.social, github: e.target.value },
                    })
                  }
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Course Assignment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="h-4 w-4 text-primary"
              />
              <Label className="text-base font-semibold">
                Assigned Courses
              </Label>
            </div>
            <div className="grid gap-3 md:grid-cols-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`course-${course.id}`}
                    checked={formData.courses_teaching.includes(course.id)}
                    onCheckedChange={() => toggleCourse(course.id)}
                  />
                  <Label
                    htmlFor={`course-${course.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {course.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status Flags */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked === true })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active Teacher
              </Label>
            </div>

            <div className="flex items-center space-x-2 border-t pt-4">
              <Checkbox
                id="isPrivileged"
                checked={formData.isPrivileged}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPrivileged: checked === true })
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor="isPrivileged"
                  className="cursor-pointer font-semibold"
                >
                  Grant Admin Panel Access
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  If checked, teacher keeps their existing password and receives
                  an email to access the admin panel. Email is required in
                  Phone/Email above to grant access. If unchecked, admin access
                  is revoked.
                </p>
                {formData.isPrivileged &&
                  (!formData.login?.trim() || !formData.login.includes("@")) && (
                    <p className="text-xs text-warning mt-1">
                      Add an email in Phone/Email above so we can send credentials; grant may fail otherwise.
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isUploading ||
                updateTeacher.isPending ||
                createTeacher.isPending ||
                uploadImage.isPending
              }
            >
              {isUploading ||
              updateTeacher.isPending ||
              createTeacher.isPending ||
              uploadImage.isPending
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Teacher"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
