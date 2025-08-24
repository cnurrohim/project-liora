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
  className = "flex gap-1 cursor-pointer hover:bg-amber-500 px-2 py-1 rounded text-white text-xs font-semibold bg-amber-600",
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
