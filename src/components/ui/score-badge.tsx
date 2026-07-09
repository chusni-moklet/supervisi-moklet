import { type ScoreCategory } from "@/lib/types";
import { cn, getScoreCategoryBg } from "@/lib/utils";

interface ScoreBadgeProps {
  category: ScoreCategory;
  className?: string;
}

export default function ScoreBadge({ category, className }: ScoreBadgeProps) {
  return (
    <span className={cn("badge", getScoreCategoryBg(category), className)}>
      {category}
    </span>
  );
}
