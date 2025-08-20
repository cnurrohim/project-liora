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
  className,
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

export function ApprovedButtonLink({ label = "Canceled", onClick }: Props) {
  return (
    <ButtonLink icon="RiCloseCircleLine" label={label} onClick={onClick} />
  );
}
