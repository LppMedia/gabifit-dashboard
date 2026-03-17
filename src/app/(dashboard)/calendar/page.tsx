import { CalendarDays } from "lucide-react";
import { PlaceholderSection } from "@/components/shared/PlaceholderSection";

export const metadata = { title: "Content Calendar · GabiFit" };

export default function CalendarPage() {
  return (
    <PlaceholderSection
      icon={CalendarDays}
      iconColor="text-emerald-400"
      title="Content Calendar"
      description="Visualise your entire content strategy at a glance. Drag-and-drop scheduling, campaign grouping, and cross-platform publishing timelines."
      stats={[
        { label: "Scheduled",   value: "0", note: "Posts queued"    },
        { label: "Drafted",     value: "0", note: "Awaiting review" },
        { label: "Published",   value: "0", note: "This month"      },
        { label: "Campaigns",   value: "0", note: "Active"          },
      ]}
      features={[
        "Monthly / weekly / list view",
        "Drag-and-drop rescheduling",
        "Multi-platform publishing",
        "Campaign color tagging",
        "Recurring post templates",
        "Team collaboration & approval flow",
        "Auto-import from content ideas",
        "Publishing conflict detection",
      ]}
    />
  );
}
