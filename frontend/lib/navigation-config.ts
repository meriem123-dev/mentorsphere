import {
  LayoutDashboard,
  FolderKanban,
  Map,
  PenSquare,
  CalendarDays,
  Compass,
  Hash,
  Bot,
  BookOpen,
  Bell,
  Users,
  UserPlus,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

export const entrepreneurNavItems: NavItem[] = [
  { label: "Dashboard", href: "/entrepreneur/dashboard", icon: LayoutDashboard },
  { label: "Startups", href: "/entrepreneur/startups", icon: FolderKanban },
  { label: "Mon Parcours", href: "/entrepreneur/parcours", icon: Map },
  { label: "Workspace", href: "/entrepreneur/workspace", icon: PenSquare },
  { label: "Calendrier", href: "/entrepreneur/calendrier", icon: CalendarDays },
  { label: "Explorer", href: "/entrepreneur/explore", icon: Compass },
  { label: "Communauté", href: "/entrepreneur/communaute", icon: Hash },
  { label: "IA Assistant", href: "/entrepreneur/ia-assistant", icon: Bot },
  { label: "Ressources", href: "/entrepreneur/ressources", icon: BookOpen },
  { label: "Notifications", href: "/entrepreneur/notifications", icon: Bell, badge: 3 },
];

export const mentorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
  { label: "Mes Mentorés", href: "/mentor/mentores", icon: Users },
  { label: "Demandes", href: "/mentor/demandes", icon: UserPlus, badge: 2 },
  { label: "Workspace", href: "/mentor/workspace", icon: PenSquare },
  { label: "Calendrier", href: "/mentor/calendrier", icon: CalendarDays },
  { label: "Communauté", href: "/mentor/communaute", icon: Hash },
  { label: "IA Assistant", href: "/mentor/ia-assistant", icon: Bot },
  { label: "Ressources", href: "/mentor/ressources", icon: BookOpen },
  { label: "Notifications", href: "/mentor/notifications", icon: Bell },
];