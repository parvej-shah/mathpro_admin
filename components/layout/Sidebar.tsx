"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  BookOpen,
  Library,
  Users,
  Megaphone,
  UserCircle2,
  LogOut,
  MonitorPlay,
  UserCheck,
  UserCheck2,
  Boxes,
  CreditCard,
  CalendarDays,
  ShieldCheck,
  Ticket,
  Mail,
  Menu,
  X,
  StarHalf,
  UserCog,
  Search,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  UsersRound,
  Lock,
  Wallet,
  MessageSquareText,
  CircleHelp,
  Quote,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePaymentBadge } from "@/hooks/usePaymentBadge";
import { hasPermission, ROUTE_PERMISSIONS } from "@/lib/permissions";
import type { RequiredPermission } from "@/lib/permissions";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  moderatorAllowed?: boolean;
  badge?: string;
  /** Required permission(s) for this tab; from ROUTE_PERMISSIONS */
  permission?: RequiredPermission;
}

const menuItems: MenuItem[] = [
  { href: "/", label: "Dashboard", icon: BarChart2, moderatorAllowed: true, permission: ROUTE_PERMISSIONS["/"] },
  { href: "/courses", label: "Courses", icon: BookOpen, moderatorAllowed: true, permission: ROUTE_PERMISSIONS["/courses"] },
  { href: "/combos", label: "Combos", icon: Boxes, adminOnly: true, badge: "New", permission: ROUTE_PERMISSIONS["/combos"] },
  { href: "/books", label: "Books", icon: Library, adminOnly: true, badge: "New", permission: ROUTE_PERMISSIONS["/books"] },
  { href: "/live-classes", label: "Live Classes", icon: MonitorPlay, moderatorAllowed: true, permission: ROUTE_PERMISSIONS["/live-classes"] },
  { href: "/users", label: "User", icon: Users, adminOnly: true, permission: ROUTE_PERMISSIONS["/users"] },
  { href: "/taken", label: "Courses Taken", icon: UserCheck, adminOnly: true, permission: ROUTE_PERMISSIONS["/taken"] },
  { href: "/prebooked", label: "Prebooked", icon: UserCheck2, adminOnly: true, permission: ROUTE_PERMISSIONS["/prebooked"] },
  { href: "/admins", label: "Admin", icon: ShieldCheck, adminOnly: true, permission: ROUTE_PERMISSIONS["/admins"] },
  { href: "/roles", label: "Role", icon: UserCog, adminOnly: true, permission: ROUTE_PERMISSIONS["/roles"] },
  { href: "/instructors", label: "Instructors", icon: UserCircle2, moderatorAllowed: true, permission: ROUTE_PERMISSIONS["/instructors"] },
  { href: "/announcements", label: "Announcements", icon: Megaphone, moderatorAllowed: true, permission: ROUTE_PERMISSIONS["/announcements"] },
  { href: "/faq-management", label: "FAQ", icon: CircleHelp, moderatorAllowed: true, permission: ROUTE_PERMISSIONS["/faq-management"] },
  { href: "/testimonial-management", label: "Testimonials", icon: Quote, moderatorAllowed: true, permission: ROUTE_PERMISSIONS["/testimonial-management"] },
  { href: "/coupon-management", label: "Coupon", icon: Ticket, adminOnly: true, permission: ROUTE_PERMISSIONS["/coupon-management"] },
  { href: "/after-purchase-messages", label: "After Purchase Messages", icon: Mail, moderatorAllowed: true, permission: ROUTE_PERMISSIONS["/after-purchase-messages"] },
  { href: "/payment-audit-log", label: "Payment Audit Log", icon: CreditCard, adminOnly: true, permission: ROUTE_PERMISSIONS["/payment-audit-log"] },
  { href: "/routines", label: "Routine", icon: CalendarDays, moderatorAllowed: true, permission: ROUTE_PERMISSIONS["/routines"] },
  { href: "/feedback-management", label: "Feedback", icon: StarHalf, adminOnly: true, badge: "New", permission: ROUTE_PERMISSIONS["/feedback-management"] },
];

interface MenuGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  /** hrefs of the items that belong to this group, in display order */
  items: string[];
}

const menuGroups: MenuGroup[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    items: ["/"],
  },
  {
    id: "content",
    label: "Content",
    icon: GraduationCap,
    items: [
      "/courses",
      "/combos",
      "/books",
      "/live-classes",
      "/routines",
      "/announcements",
      "/faq-management",
      "/testimonial-management",
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: UsersRound,
    items: [
      "/users",
      "/taken",
      "/prebooked",
      "/instructors",
    ],
  },
  {
    id: "access",
    label: "Access Control",
    icon: Lock,
    items: ["/admins", "/roles"],
  },
  {
    id: "sales",
    label: "Sales & Payments",
    icon: Wallet,
    items: [
      "/coupon-management",
      "/payment-audit-log",
      "/after-purchase-messages",
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    icon: MessageSquareText,
    items: ["/feedback-management"],
  },
];

const STORAGE_KEY = "mathpro_sidebar_expanded_groups";

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { hasNew: hasNewPayments } = usePaymentBadge();
  const { theme, setTheme, systemTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [tabSearch, setTabSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(menuGroups.map((g) => [g.id, true]))
  );

  // Prevent hydration mismatch by only showing theme icon after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
    }
  }, []);

  // Restore persisted expand/collapse state after mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, boolean>;
        setExpandedGroups((prev) => ({ ...prev, ...saved }));
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage write failures
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const permissions = user?.permissions;
  const usePermissionFilter = Array.isArray(permissions);

  const filteredMenuItems = menuItems.filter((item) => {
    // Strict RBAC menu rendering: no permission array means no tab visibility.
    if (!usePermissionFilter || item.permission === undefined) {
      return false;
    }
    return hasPermission(permissions, item.permission);
  });

  const search = tabSearch.trim().toLowerCase();
  const visibleMenuItems = filteredMenuItems.filter((item) =>
    item.label.toLowerCase().includes(search)
  );

  // Build the visible groups: only groups that have at least one visible item.
  const visibleByHref = new Map(visibleMenuItems.map((item) => [item.href, item]));
  const groupedItems = menuGroups
    .map((group) => ({
      ...group,
      items: group.items
        .map((href) => visibleByHref.get(href))
        .filter((item): item is MenuItem => item !== undefined),
    }))
    .filter((group) => group.items.length > 0);

  // While searching, force every matching group open so results are never hidden.
  const isSearching = search.length > 0;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Get user email/login
  const getUserEmail = () => {
    return user?.email || user?.login || "No email";
  };

  const renderMenuLink = (item: MenuItem) => {
    const isActive = pathname === item.href;
    const isPaymentAuditLog = item.href === "/payment-audit-log";
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => {
          // Close sidebar on mobile when clicking a link
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onToggle?.();
          }
        }}
        className={cn(
          "flex items-center rounded-md transition-colors relative",
          "hover:bg-accent",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
          isOpen ? "px-2.5 py-1.5" : "px-0 py-1.5 justify-center w-full"
        )}
        title={!isOpen ? item.label : undefined}
      >
        {isOpen ? (
          <div className="flex items-center w-full min-w-0">
            <item.icon
              className={cn(
                "w-4 h-4 flex-shrink-0",
                isActive ? "text-primary-foreground" : "text-foreground/80"
              )}
            />
            <span className="ml-2.5 text-sm font-medium flex-1 min-w-0 truncate">
              {item.label}
            </span>
            <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="h-4 px-1.5 text-[10px] font-bold leading-none"
                >
                  {item.badge}
                </Badge>
              )}
              {/* Red glowing badge for new payment audit logs */}
              {isPaymentAuditLog && hasNewPayments && (
                <span
                  className="relative flex h-3 w-3 flex-shrink-0"
                  title="New payment logs available"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-full max-w-full">
            <item.icon
              className={cn(
                "w-4 h-4 flex-shrink-0",
                isActive ? "text-primary-foreground" : "text-foreground/80"
              )}
            />
            {isPaymentAuditLog && hasNewPayments && (
              <span
                className="absolute top-1 right-1 flex h-2 w-2 flex-shrink-0 z-10 pointer-events-none"
                title="New payment logs available"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-screen flex flex-col border-r border-border bg-background z-50 transition-all duration-300 ease-in-out",
          "overflow-y-auto overflow-x-hidden",
          "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          isOpen
            ? "w-64 translate-x-0"
            : "w-16 -translate-x-full lg:translate-x-0"
        )}
        style={{ maxWidth: isOpen ? "16rem" : "4rem" }}
      >
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Toggle */}
          <div
            className={cn(
              "flex items-center border-b border-border flex-shrink-0",
              isOpen ? "justify-between px-4 h-14" : "justify-center h-14"
            )}
            style={isOpen ? { minWidth: "16rem" } : undefined}
          >
            {isOpen ? (
              <>
                <Link
                  href="/"
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <span className="font-semibold text-base whitespace-nowrap tracking-tight">
                    Math Pro
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-7 w-7"
                  onClick={onToggle}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={onToggle}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Tab Search */}
          {isOpen && (
            <div className="px-3 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={tabSearch}
                  onChange={(e) => setTabSearch(e.target.value)}
                  placeholder="Search tabs..."
                  className="h-8 pl-9 text-sm"
                />
              </div>
            </div>
          )}
          <nav
            className={cn(
              "mt-3 flex-1 overflow-y-auto overflow-x-hidden",
              isOpen ? "px-3 space-y-2" : "px-0 space-y-1"
            )}
          >
            {groupedItems.map((group) => {
              const isExpanded = isSearching || expandedGroups[group.id];
              const groupHasNewPayment =
                hasNewPayments &&
                group.items.some((i) => i.href === "/payment-audit-log");

              return (
                <div key={group.id} className={cn(isOpen ? "" : "mb-2")}>
                  {/* Group header */}
                  {isOpen ? (
                    <button
                      type="button"
                      onClick={() => !isSearching && toggleGroup(group.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1 rounded-md transition-colors",
                        "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70",
                        !isSearching && "hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <group.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1 min-w-0 text-left truncate">
                        {group.label}
                      </span>
                      {/* New-payment dot shown on collapsed group header */}
                      {!isExpanded && groupHasNewPayment && (
                        <span className="relative flex h-2 w-2 flex-shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-transform duration-200",
                          isExpanded ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>
                  ) : (
                    // Collapsed sidebar: small divider with icon as a group hint
                    <div
                      className="flex items-center justify-center py-1 text-muted-foreground"
                      title={group.label}
                    >
                      <group.icon className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Group items */}
                  {(isExpanded || !isOpen) && (
                    <div
                      className={cn(
                        "space-y-0.5",
                        isOpen ? "mt-0.5" : "mt-1"
                      )}
                    >
                      {group.items.map((item) => renderMenuLink(item))}
                    </div>
                  )}
                </div>
              );
            })}
            {isOpen && groupedItems.length === 0 && (
              <div className="px-3 py-4 text-xs text-muted-foreground">
                No tabs found
              </div>
            )}
          </nav>
        </div>

        {/* User Profile + Theme + Logout */}
        <div
          className={cn(
            "border-t border-border space-y-1 flex-shrink-0",
            isOpen ? "p-2" : "p-2"
          )}
        >
          {/* User Profile */}
          {user &&
            (isOpen ? (
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-muted/40 min-w-0 mb-1">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate leading-tight">
                    {getUserEmail()}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-center py-2"
                title={user.name || "User"}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}

          <div className="relative group">
            {isOpen ? (
              <>
                <button
                  className={cn(
                    "w-full h-auto justify-start px-2.5 py-1.5 flex items-center rounded-md transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {mounted && theme === "dark" ? (
                    <Moon className="w-4 h-4 flex-shrink-0 text-foreground/80" />
                  ) : (
                    <Sun className="w-4 h-4 flex-shrink-0 text-foreground/80" />
                  )}
                  <span className="ml-2.5 font-medium text-sm">Theme</span>
                </button>
                {/* Hover Menu */}
                <div className="absolute bottom-full left-0 mb-2 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[160px]">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        theme === "light" && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Sun className="mr-2 w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        theme === "dark" && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Moon className="mr-2 w-4 h-4" />
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={cn(
                        "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        theme === "system" && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Monitor className="mr-2 w-4 h-4" />
                      System
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                className={cn(
                  "w-full flex items-center justify-center py-2 rounded-md transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title="Theme"
              >
                {mounted && theme === "dark" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {isOpen ? (
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center w-full px-2.5 py-1.5 rounded-md transition-colors",
                "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="ml-2.5 font-medium text-sm">Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center justify-center w-full py-2 rounded-md transition-colors",
                "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              )}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
