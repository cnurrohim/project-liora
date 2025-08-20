import { type ReactNode } from "react";
import { ButtonLink } from "./ButtonLink";

type Props = {
  label?: ReactNode;
  onClick: () => void;
};

export function ViewButtonLink({ label = "Detail", onClick }: Props) {
  return <ButtonLink icon="RiEyeFill" label={label} onClick={onClick} />;
}
