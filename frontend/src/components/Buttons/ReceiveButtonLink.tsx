import { type ReactNode } from "react";
import { ButtonLink } from "./ButtonLink";

type Props = {
  label?: ReactNode;
  onClick: () => void;
  className?: string;
};

export function ReceiveButtonLink({
  label = "Receive",
  onClick,
  className,
}: Props) {
  return (
    <ButtonLink
      icon="RiShoppingBasketFill"
      label={label}
      onClick={onClick}
      className={className}
    />
  );
}

export function ReceivedButtonLink({ label = "Received", onClick }: Props) {
  return (
    <ButtonLink icon="RiShoppingBasketFill" label={label} onClick={onClick} />
  );
}
