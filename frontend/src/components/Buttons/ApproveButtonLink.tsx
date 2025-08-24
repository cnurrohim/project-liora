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
  className = "flex cursor-pointer hover:bg-green-500 px-2 py-1 rounded text-white text-xs font-semibold bg-green-400",
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
