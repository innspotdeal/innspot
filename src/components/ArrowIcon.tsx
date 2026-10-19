import Image from "next/image";

const ARROWS = {
  next: { src: "/brand/icons/next.png", width: 203, height: 139 },
  back: { src: "/brand/icons/back.png", width: 186, height: 129 },
} as const;

// أسهم الهوية: next مرسوم بيشاور يمين وback بيشاور شمال.
// مع الكلام (followText) بيتقلبوا في العربي عشان "قدّام" تبقى شمال و"رجوع" يمين؛
// من غيره بيفضلوا زي ما هما (زي أزرار يمين وشمال معرض الصور)
export default function ArrowIcon({
  direction,
  followText = true,
  className = "h-3.5 w-auto",
}: {
  direction: keyof typeof ARROWS;
  followText?: boolean;
  className?: string;
}) {
  const arrow = ARROWS[direction];
  return (
    <Image
      src={arrow.src}
      alt=""
      width={arrow.width}
      height={arrow.height}
      className={`inline-block shrink-0 ${followText ? "rtl:-scale-x-100" : ""} ${className}`}
    />
  );
}
