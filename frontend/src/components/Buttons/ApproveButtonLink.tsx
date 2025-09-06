import { type ReactNode } from "react";
import { ButtonLink } from "./ButtonLink";

type Props = {
  label?: ReactNode;
  onClick: () => void;
  className?: string;
};

export function ApproveButtonLink({
  label = "Approve",
  onClick,
  className = "flex cursor-pointer bg-[var(--info)] hover:bg-[var(--info-hover)] px-2 py-1 rounded text-[var(--text-primary)] text-xs font-semibold ",
}: Props) {
  return (
    <ButtonLink
      icon="RiCheckFill"
      label={label}
      onClick={onClick}
      className={className}
    />
  );
}
