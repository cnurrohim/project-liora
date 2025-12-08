import { type ReactNode } from "react";
import { ButtonLink } from "./ButtonLink";

type Props = {
  label?: ReactNode;
  onClick: () => void;
  className?: string;
};

export function PreviewButtonLink({
  label = "Review",
  onClick,
  className = "flex cursor-pointer hover:bg-[var(--info-hover)] bg-[var(--info)] px-2 py-1 rounded text-[var(--info-foreground)] text-xs font-semibold",
}: Props) {
  return (
    <ButtonLink
      icon="RiMenuSearchLine"
      label={label}
      onClick={onClick}
      className={className}
    />
  );
}
