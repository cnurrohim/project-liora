import { useState, useRef, useEffect, type ReactNode } from "react";
import { IconRenderer } from "../IconRenderer";

type Props = {
  mainLabel: ReactNode;
  onMainClick: () => void;
  dropdownItems: { label: ReactNode; onClick: () => void }[];
};

export function ButtonGroupWithDropdown({
  mainLabel,
  onMainClick,
  dropdownItems,
}: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex" ref={dropdownRef}>
      <button
        onClick={onMainClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-l hover:bg-gray-900 flex flex-row justify-center items-center gap-1 cursor-pointer"
      >
        {mainLabel}
      </button>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="px-2 py-2 bg-blue-600 text-white hover:bg-gray-900 rounded-r cursor-pointer"
      >
        <IconRenderer name="RiMoreFill" size={20} className="text-white" />
      </button>

      {open && (
        <ul className="absolute top-full right-0 z-10 mt-1 w-48 bg-gray-900 text-white rounded shadow">
          {dropdownItems.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-950 flex flex-row items-center gap-1"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
