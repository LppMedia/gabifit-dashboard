import { BarChart2 } from "lucide-react";
import { PlaceholderSection } from "@/components/shared/PlaceholderSection";

export const metadata = { title: "Analytics · GabiFit" };

export default function AnalyticsPage() {
  return (
    <PlaceholderSection
      icon={BarChart2}
      iconColor="text-cyan-400"
      title="Analytics"
      description="Deep-dive into your audience growth, content performance, and engagement trends across all platforms with interactive charts and reports."
      stats={[
        { label: "Total Reach",    value: "—", note: "Connect accounts" },
        { label: "Impressions",    value: "—", note: "No data yet"      },
        { label: "Link Clicks",    value: "—", note: "No data yet"      },
        { label: "Profile Visits", value: "—", note: "No data yet"      },
      ]}
      features={[
        "Follower growth chart (30 / 90d)",
        "Engagement rate over time",
        "Top performing posts",
        "Audience demographics",
        "Platform comparison view",
        "Exportable PDF / CSV reports",
        "Custom date range picker",
        "Real-time notification alerts",
      ]}
    />
  );
}
