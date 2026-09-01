import Image from "next/image";
import {
  ILLUSTRATION_LABELS,
  ILLUSTRATION_SRC,
  type IllustrationId,
} from "./types";

export type { IllustrationId } from "./types";
export {
  ILLUSTRATION_LABELS,
  ILLUSTRATION_SRC,
  SERVICE_ILLUSTRATION,
  illustrationForService,
} from "./types";

export function Illustration({
  id,
  className = "",
  title,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  id: IllustrationId;
  className?: string;
  title?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={ILLUSTRATION_SRC[id]}
      alt={title || ILLUSTRATION_LABELS[id]}
      fill
      priority={priority}
      className={`object-cover object-center ${className}`}
      sizes={sizes}
    />
  );
}

/** Framed illustration for service/category blocks. */
export function IllustrationPanel({
  id,
  className = "",
  title,
  aspect = "4/3",
  priority = false,
}: {
  id: IllustrationId;
  className?: string;
  title?: string;
  aspect?: "4/3" | "3/4" | "1/1" | "16/9";
  priority?: boolean;
}) {
  const aspectClass =
    aspect === "3/4"
      ? "aspect-[3/4]"
      : aspect === "1/1"
        ? "aspect-square"
        : aspect === "16/9"
          ? "aspect-video"
          : "aspect-[4/3]";

  return (
    <div
      className={`illustration-panel relative overflow-hidden ${aspectClass} ${className}`}
    >
      <Illustration id={id} title={title} priority={priority} />
    </div>
  );
}
