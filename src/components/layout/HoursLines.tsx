import { formatHoursLines } from "@/lib/site";

export function HoursLines({
  hours,
  className = "mt-3 space-y-1 text-sm text-salon-body",
}: {
  hours: string;
  className?: string;
}) {
  const lines = formatHoursLines(hours);
  if (!lines.length) return null;

  return (
    <ul className={className}>
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}
