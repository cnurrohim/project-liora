import { type ReactNode } from "react";

type Props = {
  mainLabel: ReactNode;
  onClick: () => void;
  icon: ReactNode;
};

export function ActionButtonLink({ mainLabel, onClick, icon }: Props) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-gray-300 rounded hover:border-lime-400 hover:text-lime-400 text-sm flex items-center gap-1 cursor-pointer"
    >
      {icon} {mainLabel}
    </button>
  );
}
