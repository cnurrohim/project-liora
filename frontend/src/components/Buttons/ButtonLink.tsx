import { type ReactNode } from "react";
import { IconRenderer } from "../IconRenderer";

type Props = {
  label?: ReactNode;
  onClick: () => void;
  icon?: string;
  className?: string;
};

export function ButtonLink({
  label = "Button",
  onClick,
  icon,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className
          ? className
          : "px-2 py-1 text-[var(--text-primary)] rounded hover:border-[var(--border-highlight)] hover:text-[var(--text-hover)] hover:bg-[var(--background)] text-sm flex items-center gap-1 cursor-pointer"
      }
    >
      <IconRenderer name={icon} size={15} /> {label}
    </button>
  );
}
