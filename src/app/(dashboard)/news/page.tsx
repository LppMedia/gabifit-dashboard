import { Newspaper } from "lucide-react";
import { PlaceholderSection } from "@/components/shared/PlaceholderSection";

export const metadata = { title: "News Consolidator · GabiFit" };

export default function NewsPage() {
  return (
    <PlaceholderSection
      icon={Newspaper}
      iconColor="text-sky-400"
      title="News Consolidator"
      description="Stay informed without the noise. Aggregates fitness, nutrition, wellness, and social media industry news from curated RSS feeds and newsletters."
      stats={[
        { label: "Sources",   value: "0", note: "RSS feeds added"   },
        { label: "Unread",    value: "0", note: "Articles today"    },
        { label: "Saved",     value: "0", note: "Bookmarked"        },
        { label: "Topics",    value: "0", note: "Tracked keywords"  },
      ]}
      features={[
        "RSS / Atom feed aggregation",
        "Keyword & topic filtering",
        "AI-generated article summaries",
        "Save & tag articles for reference",
        "Content idea extraction",
        "Daily digest email",
        "Source credibility scoring",
        "Trending topic alerts",
      ]}
    />
  );
}
