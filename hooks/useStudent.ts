import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";

const QUERY_KEYS = {
  all: ["students"] as const,
  profile: (userId: number) => [...QUERY_KEYS.all, "profile", userId] as const,
};

export function useStudentProfile(userId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.profile(userId!),
    queryFn: () => studentService.getStudentProfile(userId!),
    enabled: !!userId,
  });
}
