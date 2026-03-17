import { Swords } from "lucide-react";
import { PlaceholderSection } from "@/components/shared/PlaceholderSection";

export const metadata = { title: "Competitors Tracker · GabiFit" };

export default function CompetitorsPage() {
  return (
    <PlaceholderSection
      icon={Swords}
      iconColor="text-amber-400"
      title="Competitors Tracker"
      description="Keep a close eye on competing fitness creators and brands. Track their posting frequency, engagement benchmarks, top content, and growth trends."
      stats={[
        { label: "Tracked",        value: "0", note: "Competitors added" },
        { label: "Alerts",         value: "0", note: "Unread"            },
        { label: "Avg. Eng. Rate", value: "—", note: "Competitors avg."  },
        { label: "Top Platform",   value: "—", note: "Most active"       },
      ]}
      features={[
        "Add & manage competitor profiles",
        "Follower & engagement benchmarking",
        "Top posts spy tool",
        "Posting frequency heatmap",
        "Hashtag & keyword overlap",
        "Weekly comparison digest",
        "Content gap analysis",
        "Automated change alerts",
      ]}
    />
  );
}
