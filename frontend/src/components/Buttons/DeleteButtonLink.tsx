import { type ReactNode } from "react";
import { IconRenderer } from "../IconRenderer";

type Props = {
  mainLabel?: ReactNode;
  onMainClick: () => void;
};

export function DeleteButtonLink({ mainLabel = "Hapus", onMainClick }: Props) {
  return (
    <button
      onClick={onMainClick}
      className="px-2 py-1 text-gray-300 rounded hover:border-lime-400 hover:text-lime-400 text-sm flex items-center gap-1 cursor-pointer"
    >
      <IconRenderer name="RiDeleteBin2Fill" size={15} className="text-white" />{" "}
      {mainLabel}
    </button>
  );
}
