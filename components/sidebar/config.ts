import type { NavItem, SidebarContent, SidebarSectionKey } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "projects", label: "Projects", icon: "projects" },
  { key: "calendar", label: "Calendar", icon: "calendar" },
  { key: "teams", label: "Teams", icon: "teams" },
  { key: "analytics", label: "Analytics", icon: "analytics" },
];

export const SIDEBAR_CONTENT: Record<SidebarSectionKey, SidebarContent> = {
  dashboard: {
    title: "Dashboard",
    groups: [
      {
        title: "Overview",
        items: [
          { label: "Summary", icon: "report", active: true },
          { label: "Weekly health", icon: "clock" },
        ],
      },
      {
        title: "Highlights",
        items: [
          {
            label: "Top metrics",
            icon: "analytics",
            children: [
              { label: "Conversion: 34.2%" },
              { label: "Retention: 92%" },
            ],
          },
        ],
      },
    ],
  },
  projects: {
    title: "Projects",
    groups: [
      {
        title: "Actions",
        items: [
          { label: "New project", icon: "plus" },
          { label: "All folders", icon: "folder" },
        ],
      },
      {
        title: "Active",
        items: [
          {
            label: "Platform Revamp",
            icon: "projects",
            children: [
              { label: "Design system" },
              { label: "Dashboard refactor" },
            ],
          },
        ],
      },
    ],
  },
  calendar: {
    title: "Calendar",
    groups: [
      {
        title: "Today",
        items: [
          { label: "Standup - 9:00 AM", icon: "clock" },
          { label: "Client sync - 2:00 PM", icon: "calendar" },
        ],
      },
    ],
  },
  teams: {
    title: "Teams",
    groups: [
      {
        title: "My teams",
        items: [
          {
            label: "Engineering",
            icon: "teams",
            children: [{ label: "6 members" }, { label: "2 active goals" }],
          },
          { label: "Design", icon: "teams" },
        ],
      },
    ],
  },
  analytics: {
    title: "Analytics",
    groups: [
      {
        title: "Reports",
        items: [
          { label: "Performance", icon: "analytics" },
          { label: "Task throughput", icon: "task" },
        ],
      },
    ],
  },
  settings: {
    title: "Settings",
    groups: [
      {
        title: "Workspace",
        items: [
          { label: "Preferences", icon: "settings" },
          { label: "Profile", icon: "user" },
        ],
      },
    ],
  },
};

export function getSidebarContent(section: SidebarSectionKey): SidebarContent {
  return SIDEBAR_CONTENT[section];
}
