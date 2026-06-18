"use client";

// style_tag → Phosphor 图标。客户端组件，RSC 页面可直接嵌入
import {
  Armchair,
  Bank,
  Buildings,
  CarProfile,
  Compass,
  ForkKnife,
  GameController,
  HeartStraight,
  HouseLine,
  Mountains,
  MoonStars,
  PaintBrush,
  PersonSimpleRun,
  Waves,
  type Icon,
} from "@phosphor-icons/react";
import type { StyleTag } from "@/lib/types";

const ICONS: Record<StyleTag, Icon> = {
  outdoor: Mountains,
  city: Buildings,
  active: PersonSimpleRun,
  chill: Armchair,
  romantic: HeartStraight,
  playful: GameController,
  creative: PaintBrush,
  culture: Bank,
  food: ForkKnife,
  nightlife: MoonStars,
  adventure: Compass,
  water: Waves,
  home: HouseLine,
  roadtrip: CarProfile,
};

export function TagIcon({
  tags,
  size = 18,
  weight = "regular",
  className,
}: {
  tags: string[];
  size?: number;
  weight?: "regular" | "fill" | "duotone";
  className?: string;
}) {
  const IconComp = ICONS[(tags[0] as StyleTag) ?? "romantic"] ?? HeartStraight;
  return <IconComp size={size} weight={weight} className={className} />;
}
