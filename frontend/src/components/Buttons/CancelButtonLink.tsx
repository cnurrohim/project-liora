import { type ReactNode } from "react";
import { ButtonLink } from "./ButtonLink";

type Props = {
  label?: ReactNode;
  onClick: () => void;
  className?: string;
};

export function CancelButtonLink({
  label = "Cancel",
  onClick,
  className = "flex items-center gap-1 cursor-pointer text-(--warning-foreground) bg-(--warning) hover:bg-(--warning-hover) px-2 py-1 rounded text-xs font-semibold",
}: Props) {
  return (
    <ButtonLink
      icon="RiCloseCircleLine"
      label={label}
      onClick={onClick}
      className={className}
    />
  );
}
