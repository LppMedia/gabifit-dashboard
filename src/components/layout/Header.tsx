"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Map pathnames → readable titles
const ROUTE_TITLES: Record<string, string> = {
  "/":            "Overview",
  "/instagram":   "Instagram Manager",
  "/analytics":   "Analytics",
  "/calendar":    "Content Calendar",
  "/competitors": "Competitors Tracker",
  "/news":        "News Consolidator",
};

export function Header() {
  const pathname = usePathname();

  // Match the deepest known route
  const title =
    Object.entries(ROUTE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([route]) => pathname === route || pathname.startsWith(route + "/"))?.[1] ??
    "Dashboard";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 justify-center rounded-full p-0 text-[9px] bg-primary text-primary-foreground">
            3
          </Badge>
        </Button>

        {/* Avatar placeholder */}
        <div className="ml-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground select-none">
          GF
        </div>
      </div>
    </header>
  );
}
