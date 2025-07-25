import { type ReactNode } from "react";

type Props = {
  mainLabel: ReactNode;
  onMainClick: () => void;
  icon: ReactNode;
};

export function ActionButtonLink({ mainLabel, onMainClick, icon }: Props) {
  return (
    <button
      onClick={onMainClick}
      className="px-2 py-1 text-gray-300 rounded hover:border-lime-400 hover:text-lime-400 text-sm flex items-center gap-1 cursor-pointer"
    >
      {icon} {mainLabel}
    </button>
  );
}
