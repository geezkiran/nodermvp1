import {
  BarChart3,
  Calendar,
  ChevronDown,
  FileText,
  Folder,
  LayoutDashboard,
  ListTodo,
  PanelLeft,
  PanelRight,
  Plus,
  Search,
  Settings,
  Clock3,
  User,
  Users,
} from "lucide-react";

import type { SidebarIconName } from "./types";

type IconProps = {
  name: SidebarIconName;
  size?: number;
  className?: string;
};

export function SidebarIcon({ name, size = 16, className }: IconProps) {
  const props = { size, className };

  switch (name) {
    case "dashboard":
      return <LayoutDashboard {...props} />;
    case "projects":
      return <Folder {...props} />;
    case "calendar":
      return <Calendar {...props} />;
    case "teams":
      return <Users {...props} />;
    case "analytics":
      return <BarChart3 {...props} />;
    case "settings":
      return <Settings {...props} />;
    case "search":
      return <Search {...props} />;
    case "chevron":
      return <ChevronDown {...props} />;
    case "panel-close":
      return <PanelRight {...props} />;
    case "panel-open":
      return <PanelLeft {...props} />;
    case "user":
      return <User {...props} />;
    case "task":
      return <ListTodo {...props} />;
    case "folder":
      return <Folder {...props} />;
    case "report":
      return <FileText {...props} />;
    case "plus":
      return <Plus {...props} />;
    case "clock":
      return <Clock3 {...props} />;
    default:
      return null;
  }
}
