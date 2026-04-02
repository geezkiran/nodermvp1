"use client";

import Image from "next/image";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { EditorCanvas } from "@/features/editor/components/editor-canvas";
import { getSidebarContent, NAV_ITEMS } from "./config";
import { SidebarIcon } from "./icons";
import type { MenuItem, SidebarSectionKey } from "./types";

const easing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

function Avatar() {
  return (
    <div className="relative size-8 shrink-0 rounded-full bg-black">
      <div className="flex size-8 items-center justify-center">
        <SidebarIcon name="user" size={16} className="text-neutral-50" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full border border-neutral-800"
      />
    </div>
  );
}

function SearchBox({ collapsed }: { collapsed: boolean }) {
  const [value, setValue] = useState("");

  if (collapsed) {
    return null;
  }

  return (
    <div
      className="relative w-full transition-all duration-300"
      style={{ transitionTimingFunction: easing }}
    >
      <div
        className="relative flex h-9 w-full items-center rounded-lg bg-black pl-2 transition-all duration-300"
        style={{ transitionTimingFunction: easing }}
      >
        <div className="flex size-8 items-center justify-center p-0">
          <SidebarIcon name="search" size={16} className="text-neutral-50" />
        </div>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search..."
          className="w-full bg-transparent pr-0 text-sm text-neutral-50 outline-none placeholder:text-neutral-400"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg border border-neutral-800"
        />
      </div>
    </div>
  );
}

function NavButton({
  active,
  collapsed,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  collapsed: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-lg transition-colors ${
        active
          ? "bg-neutral-800 text-neutral-50"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
      } ${collapsed ? "size-10 justify-center" : "h-9 w-full px-3"}`}
    >
      {icon}
      {!collapsed && <span className="ml-3 truncate text-sm text-neutral-50">{label}</span>}
    </button>
  );
}

function SidebarRow({
  item,
  collapsed,
  expanded,
  onToggle,
}: {
  item: MenuItem;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasChildren = Boolean(item.children?.length);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={hasChildren ? onToggle : undefined}
        title={collapsed ? item.label : undefined}
        className={`flex h-8 w-full items-center rounded-lg transition-colors ${
          item.active ? "bg-neutral-800" : "hover:bg-neutral-800"
        } ${collapsed ? "justify-center" : "px-3"}`}
      >
        {item.icon ? (
          <SidebarIcon name={item.icon} size={16} className="text-neutral-50" />
        ) : (
          <div className="size-4" />
        )}
        {!collapsed && <span className="ml-3 truncate text-sm text-neutral-50">{item.label}</span>}
        {!collapsed && hasChildren && (
          <span className="ml-auto">
            <SidebarIcon
              name="chevron"
              size={16}
              className={`text-neutral-50 transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
            />
          </span>
        )}
      </button>

      {!collapsed && expanded && hasChildren && (
        <div className="mt-1 space-y-0.5 pl-9">
          {item.children?.map((child) => (
            <div
              key={child.label}
              className="h-8 truncate rounded-lg px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              {child.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SingleSidebar({
  activeSection,
  onSectionChange,
}: {
  activeSection: SidebarSectionKey;
  onSectionChange: (value: SidebarSectionKey) => void;
}) {
  const minSidebarWidth = 260;
  const maxSidebarWidth = 460;
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const content = useMemo(() => getSidebarContent(activeSection), [activeSection]);

  useEffect(() => {
    if (collapsed) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        setCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [collapsed]);

  const toggleRow = (key: string) => {
    setExpandedRows((state) => ({ ...state, [key]: !state[key] }));
  };

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (collapsed) {
      return;
    }

    event.preventDefault();

    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const next = startWidth + (moveEvent.clientX - startX);
      const clamped = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, next));
      setSidebarWidth(clamped);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div ref={sidebarRef} className="relative h-full">
      <aside
        className={`flex h-full flex-col rounded-2xl border border-white/10 bg-black/20 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-16 px-3" : ""
        }`}
        style={{
          width: collapsed ? 64 : sidebarWidth,
          transitionTimingFunction: easing,
        }}
      >
        <div
          className={`flex h-10 items-center ${collapsed ? "mb-10 justify-center" : "mb-5 justify-between"}`}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Image src="/assets/logoiconmob.png" alt="Logo" width={26} height={26} priority />
          </div>

          {!collapsed && (
            <h2 className="flex-1 px-3 text-lg font-medium leading-none text-neutral-50">
              {content.title}
            </h2>
          )}

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="flex size-10 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
              aria-label="Collapse sidebar"
            >
              <SidebarIcon name="panel-close" size={16} />
            </button>
          )}
        </div>

        <SearchBox collapsed={collapsed} />
        {!collapsed && <div className="my-4 border-t border-neutral-800" />}

        <div className="flex w-full flex-col gap-2">
          {NAV_ITEMS.map((item, index) => (
            <Fragment key={item.key}>
              {index === 1 && collapsed && (
                <NavButton
                  key="collapsed-search"
                  collapsed={collapsed}
                  icon={<SidebarIcon name="search" size={16} />}
                  label="Search"
                  onClick={() => setCollapsed(false)}
                />
              )}
              <NavButton
                key={item.key}
                active={activeSection === item.key}
                collapsed={collapsed}
                icon={<SidebarIcon name={item.icon} size={16} />}
                label={item.label}
                onClick={() => {
                  onSectionChange(item.key);
                  if (collapsed) {
                    setCollapsed(false);
                  }
                }}
              />
            </Fragment>
          ))}
        </div>

        <div className={`mt-4 w-full space-y-3 overflow-y-auto ${collapsed ? "hidden" : ""}`}>
          {content.groups.map((group) => (
            <div key={group.title} className="w-full">
              <h3 className="mb-1.5 px-3 text-sm font-normal text-neutral-400">{group.title}</h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const key = `${group.title}-${item.label}`;
                  return (
                    <SidebarRow
                      key={key}
                      item={item}
                      collapsed={collapsed}
                      expanded={Boolean(expandedRows[key])}
                      onToggle={() => toggleRow(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <NavButton
            active={activeSection === "settings"}
            collapsed={collapsed}
            icon={<SidebarIcon name="settings" size={16} />}
            label="Settings"
            onClick={() => {
              onSectionChange("settings");
              if (collapsed) {
                setCollapsed(false);
              }
            }}
          />

          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2 px-2 py-2"}`}>
            <Avatar />
            {!collapsed && <span className="text-sm text-neutral-50">Workspace</span>}
          </div>
        </div>
      </aside>

      {!collapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize menu"
          onPointerDown={startResize}
          className="absolute inset-y-0 -right-2 z-30 w-3 cursor-col-resize"
        />
      )}

    </div>
  );
}

export function AppSidebar() {
  const [activeSection, setActiveSection] = useState<SidebarSectionKey>("dashboard");

  return (
    <div className="flex h-screen w-screen items-stretch overflow-hidden bg-[#1a1a1a]">
      <div className="relative hidden h-full flex-1 md:flex">
        <EditorCanvas />

        <div className="pointer-events-none absolute inset-y-4 left-4 z-20">
          <div className="pointer-events-auto h-full">
            <SingleSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 md:hidden">
        <div className="rounded-lg border border-neutral-700 bg-black/80 px-4 py-3 text-center text-sm text-neutral-100">
          Use desktop to continue viewing.
        </div>
      </div>
    </div>
  );
}

export function Frame760() {
  return <AppSidebar />;
}

export default AppSidebar;
