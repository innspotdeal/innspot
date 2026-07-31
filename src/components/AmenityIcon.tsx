import CheckIcon from "@/components/CheckIcon";
import { getAmenityIconClass } from "@/lib/amenityIcon";

export default function AmenityIcon({ text }: { text: string }) {
  const iconClass = getAmenityIconClass(text);

  if (!iconClass) {
    return <CheckIcon />;
  }

  return (
    <i
      className={`${iconClass} w-5 shrink-0 text-center text-lg text-brand-orange`}
      aria-hidden="true"
    />
  );
}
