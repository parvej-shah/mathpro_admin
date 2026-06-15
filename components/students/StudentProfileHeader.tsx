"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSchool,
  faUsers,
  faGlobe,
  faMapMarkerAlt,
  faLightbulb,
  faCalendar,
  faTools,
  faVenusMars,
} from "@fortawesome/free-solid-svg-icons";
import type { StudentBasicInfo } from "@/services/student.service";

interface StudentProfileHeaderProps {
  basicInfo: StudentBasicInfo;
}

const getInterestLabel = (interest: string): string => {
  const interestMap: Record<string, string> = {
    COMPETITIVEPROGRAMMING: "Competitive Programming",
    WEBDEVELOPMENT: "Web Development",
    APPDEVELOPMENT: "App Development",
    DATASTRUCTURE: "Data Structure",
    MACHINELEARNING: "Machine Learning",
    DATASCIENCE: "Data Science",
  };
  return interestMap[interest] || interest;
};

const getClassLevelLabel = (level: string): string => {
  const levelMap: Record<string, string> = {
    JSC: "JSC",
    SSC: "SSC",
    HSC: "HSC",
  };
  return levelMap[level] || level;
};

export function StudentProfileHeader({ basicInfo }: StudentProfileHeaderProps) {
  return (
    <Card className="relative overflow-hidden border-primary/10 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary via-primary/90 to-indigo-500" />
      <div className="absolute -top-16 right-0 h-52 w-52 rounded-full bg-white/20 blur-2xl" />
      <CardContent className="px-6 pb-7 pt-12 md:px-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative mt-2">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-indigo-500 opacity-80 blur-sm" />
            <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
              <AvatarFallback className="text-3xl font-bold bg-background text-primary">
                {basicInfo.name?.charAt(0)?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 pt-4 text-center md:text-left">
            <h2 className="mb-1 text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
              {basicInfo.name || "Student Name"}
            </h2>
            <p className="text-sm mt-3 text-black drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]">
              Unified student profile and learning history
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {basicInfo.schoolCollege && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                >
                  <FontAwesomeIcon icon={faSchool} className="h-3 w-3" />
                  {basicInfo.schoolCollege}
                </Badge>
              )}

              {basicInfo.group && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                >
                  <FontAwesomeIcon icon={faUsers} className="h-3 w-3" />
                  {basicInfo.group}
                </Badge>
              )}

              {basicInfo.classLevel && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                >
                  <FontAwesomeIcon icon={faSchool} className="h-3 w-3" />
                  {getClassLevelLabel(basicInfo.classLevel)}
                </Badge>
              )}

              {basicInfo.version && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                >
                  <FontAwesomeIcon icon={faGlobe} className="h-3 w-3" />
                  {basicInfo.version}
                </Badge>
              )}

              {basicInfo.gender && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                >
                  <FontAwesomeIcon icon={faVenusMars} className="h-3 w-3" />
                  {basicInfo.gender}
                </Badge>
              )}

              {basicInfo.districtName && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
                  {basicInfo.districtName}
                </Badge>
              )}

              {basicInfo.interestedTopic && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                >
                  <FontAwesomeIcon icon={faLightbulb} className="h-3 w-3" />
                  {getInterestLabel(basicInfo.interestedTopic)}
                </Badge>
              )}

              {basicInfo.passingYear && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                >
                  <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                  Passing: {basicInfo.passingYear}
                </Badge>
              )}

              {basicInfo.skills &&
                basicInfo.skills.slice(0, 2).map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-white backdrop-blur-sm"
                  >
                    <FontAwesomeIcon icon={faTools} className="h-3 w-3" />
                    {String(skill.skillName)}
                  </Badge>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
