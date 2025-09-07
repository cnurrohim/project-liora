import { type ReactNode } from "react";
import { IconRenderer } from "../IconRenderer";

type Props = {
  label?: ReactNode;
  onClick: () => void;
  icon?: string;
  className?: string;
};

export function TextLink({ label = "link", onClick, icon, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className
          ? className
          : "text-[var(--content-text-muted)] hover:text-[var(--content-text-hover)] text-sm flex items-center gap-1 cursor-pointer"
      }
    >
      <IconRenderer
        name={icon}
        size={15}
        className="text-[var(--content-text-muted)]"
      />{" "}
      {label}
    </button>
  );
}
