import { type ReactNode } from "react";
import { IconRenderer } from "../IconRenderer";

type Props = {
  label?: ReactNode;
  onClick: () => void;
  icon?: string;
};

export function ButtonLink({ label = "Button", onClick, icon }: Props) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-gray-300 rounded hover:border-lime-400 hover:text-lime-400 text-sm flex items-center gap-1 cursor-pointer"
    >
      <IconRenderer name={icon} size={15} className="text-white" /> {label}
    </button>
  );
}
