"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faCode,
  faSchool,
  faMapMarkerAlt,
  faAddressCard,
  faCalendar,
  faUsers,
  faUser,
  faVenusMars,
  faGlobe,
  faPeopleArrows,
} from "@fortawesome/free-solid-svg-icons";
import type { StudentBasicInfo } from "@/services/student.service";

interface StudentDetailsProps {
  basicInfo: StudentBasicInfo;
}

const fieldConfig = [
  { label: "Phone", key: "phone", icon: faPhone },
  { label: "Email", key: "email", icon: faEnvelope },
  { label: "CF Handle", key: "cf_handle", icon: faCode, fallback: "Not set" },
  { label: "Facebook ID", key: "facebookId", icon: faAddressCard, fallback: "Not set" },
  { label: "Address", key: "address", icon: faMapMarkerAlt, fallback: "Not set" },
  { label: "School / College", key: "schoolCollege", icon: faSchool, fallback: "Not set" },
  { label: "Group", key: "group", icon: faUsers, fallback: "Not set" },
  {
    label: "Guardian Name",
    key: "guardianName",
    icon: faUser,
    fallback: "Not set",
  },
  {
    label: "Guardian Mobile",
    key: "guardianMobile",
    icon: faPhone,
    fallback: "Not set",
  },
  {
    label: "Relation",
    key: "relationWithGuardian",
    icon: faPeopleArrows,
    fallback: "Not set",
  },
  {
    label: "Gender",
    key: "gender",
    icon: faVenusMars,
    fallback: "Not set",
  },
  {
    label: "Class",
    key: "classLevel",
    icon: faCalendar,
    fallback: "Not set",
  },
  {
    label: "Version",
    key: "version",
    icon: faGlobe,
    fallback: "Not set",
  },
];

export function StudentDetails({ basicInfo }: StudentDetailsProps) {
  return (
    <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
      <CardHeader className="border-b border-border/70 px-5 py-4">
        <CardTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faSchool} className="h-5 w-5 text-primary" />
          Profile Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {fieldConfig.map((field) => {
            const rawValue = basicInfo[field.key];
            const value =
              typeof rawValue === "string" && rawValue.trim()
                ? rawValue
                : field.fallback || "N/A";

            const normalizedValue =
              field.key === "classLevel" && value !== "Not set" && value !== "N/A"
                ? value.toUpperCase()
                : value;

            return (
              <div
                key={field.key}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/45 p-3.5"
              >
                <Avatar className="h-9 w-9 rounded-2xl bg-primary/10">
                  <AvatarFallback className="rounded-2xl text-primary">
                    <FontAwesomeIcon icon={field.icon} className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="truncate text-sm font-semibold">{normalizedValue}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Location / skills Section */}
        {(basicInfo.districtName || basicInfo.skills?.length) && (
          <div className="mt-8">
            {basicInfo.districtName && (
              <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Location
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold">
                  {basicInfo.districtName}
                  {basicInfo.subDistrict ? `, ${basicInfo.subDistrict}` : ""}
                </p>
              </div>
            )}

            {basicInfo.skills && basicInfo.skills.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <FontAwesomeIcon icon={faCode} className="h-5 w-5 text-primary" />
                  Skills
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {basicInfo.skills.map((skill, index) => {
                    const experienceYear = Number(
                      (skill as { experienceYear?: string }).experienceYear || 0
                    );
                    const progress = Math.min(experienceYear * 20, 100);

                    return (
                      <Card key={index} className="rounded-2xl border-border/70 bg-background/45">
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">
                              {String(skill.skillName)}
                            </p>
                            <Badge variant="secondary" className="rounded-full text-xs">
                              {experienceYear} YRS
                            </Badge>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
