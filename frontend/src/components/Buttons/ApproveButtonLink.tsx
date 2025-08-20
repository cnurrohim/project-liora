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
  className,
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

export function ApprovedButtonLink({ label = "Approved", onClick }: Props) {
  return (
    <ButtonLink icon="RiCheckDoubleLine" label={label} onClick={onClick} />
  );
}
