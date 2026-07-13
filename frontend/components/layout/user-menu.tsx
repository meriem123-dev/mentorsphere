"use client";

import { Menu } from "@base-ui/react/menu";
import NextLink from "next/link";
import { LogOut, ChevronDown,type LucideIcon } from "lucide-react";

interface UserMenuAction {
  label: string;
  href: string;
  icon: LucideIcon;
}


interface UserMenuProps {
  name: string;
  subtitle?: string;
  initials: string;
  avatarUrl?: string;
  avatarColor?: string;
  primaryAction?: UserMenuAction;
  onLogout: () => void;
  align?: "start" | "end";
}

export function UserMenu({
  name,
  subtitle,
  initials,
  avatarUrl,
  avatarColor = "bg-gradient-brand", // fallback si vraiment rien n'est fourni
  primaryAction,
  onLogout,
  align = "end",
}: UserMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger className="...">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor}`}
          >
            {initials}
          </span>
        )}
        
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={10} align={align}>
          <Menu.Popup className="w-60 origin-top-right rounded-2xl border border-border bg-card p-1.5 shadow-xl data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 transition-[opacity,transform] duration-150">
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-medium text-foreground">
                {name}
              </p>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            <Menu.Separator className="my-1 h-px bg-border" />

            {primaryAction && (
              <Menu.Item
                render={<NextLink href={primaryAction.href} />}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-muted"
              >
                <primaryAction.icon className="h-4 w-4 text-muted-foreground" />
                {primaryAction.label}
              </Menu.Item>
            )}

            <Menu.Item
              onClick={onLogout}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-brand-rose outline-none data-[highlighted]:bg-brand-rose/8"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
