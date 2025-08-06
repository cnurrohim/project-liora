import { type ReactNode } from "react";
import { ButtonLink } from "./ButtonLink";

type Props = {
  label?: ReactNode;
  onClick: () => void;
};

export function EditButtonLink({ label = "Edit", onClick }: Props) {
  return <ButtonLink icon="RiPencilFill" label={label} onClick={onClick} />;
}
