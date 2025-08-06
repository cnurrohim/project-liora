import { type ReactNode } from "react";
import { ButtonLink } from "./ButtonLink";

type Props = {
  label?: ReactNode;
  onClick: () => void;
};

export function DeleteButtonLink({ label = "Hapus", onClick }: Props) {
  return <ButtonLink icon="RiDeleteBin2Fill" label={label} onClick={onClick} />;
}
