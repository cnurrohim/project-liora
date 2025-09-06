import { useState, useRef, useEffect, type ReactNode } from "react";
import { IconRenderer } from "../IconRenderer";

type Props = {
  mainLabel: ReactNode;
  onClick: () => void;
  dropdownItems: { label: ReactNode; onClick: () => void }[];
};

export function ButtonGroupWithDropdown({
  mainLabel,
  onClick,
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
    <div
      className="relative inline-flex text-[var(--text-primary)]"
      ref={dropdownRef}
    >
      <button
        onClick={onClick}
        className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--accent-foreground)] rounded-l hover:bg-[var(--accent-highlight)] flex flex-row justify-center items-center gap-1 cursor-pointer"
      >
        {mainLabel}
      </button>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="px-2 py-2 bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-highlight)] rounded-r cursor-pointer"
      >
        <IconRenderer name="RiMoreFill" size={20} />
      </button>

      {open && (
        <ul className="absolute top-full right-0 z-10 mt-1 w-48 bg-[var(--accent-primary)] text-[var(--accent-foreground)] rounded shadow">
          {dropdownItems.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-[var(--accent-highlight)] flex flex-row items-center gap-1"
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
