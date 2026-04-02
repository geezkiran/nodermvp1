export type SidebarSectionKey =
  | "dashboard"
  | "projects"
  | "calendar"
  | "teams"
  | "analytics"
  | "settings";

export type SidebarIconName =
  | "dashboard"
  | "projects"
  | "calendar"
  | "teams"
  | "analytics"
  | "settings"
  | "search"
  | "chevron"
  | "panel-close"
  | "panel-open"
  | "user"
  | "task"
  | "folder"
  | "report"
  | "plus"
  | "clock";

export type MenuItem = {
  label: string;
  icon?: SidebarIconName;
  active?: boolean;
  children?: MenuItem[];
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export type SidebarContent = {
  title: string;
  groups: MenuGroup[];
};

export type NavItem = {
  key: SidebarSectionKey;
  label: string;
  icon: SidebarIconName;
};
