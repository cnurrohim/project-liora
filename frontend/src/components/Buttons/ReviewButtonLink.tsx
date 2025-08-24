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
  className = "flex cursor-pointer hover:bg-blue-500 px-2 py-1 rounded text-white text-xs font-semibold bg-blue-400",
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
