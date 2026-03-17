import { Instagram } from "lucide-react";
import { PlaceholderSection } from "@/components/shared/PlaceholderSection";

export const metadata = { title: "Instagram Manager · GabiFit" };

export default function InstagramPage() {
  return (
    <PlaceholderSection
      icon={Instagram}
      iconColor="text-pink-400"
      title="Instagram Manager"
      description="Create, schedule, and publish posts, stories, and reels. Monitor engagement and manage your content pipeline all from one place."
      stats={[
        { label: "Followers",    value: "—",  note: "Connect account" },
        { label: "Posts",        value: "—",  note: "No data yet"     },
        { label: "Avg. Reach",   value: "—",  note: "No data yet"     },
        { label: "Eng. Rate",    value: "—",  note: "No data yet"     },
      ]}
      features={[
        "Post composer with image/video upload",
        "Story & Reel scheduler",
        "Caption AI assistant",
        "Hashtag generator",
        "Best-time-to-post insights",
        "Comment moderation queue",
        "Grid preview planner",
        "Performance per post",
      ]}
    />
  );
}
