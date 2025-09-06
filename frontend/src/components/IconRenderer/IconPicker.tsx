import React, { useState, useMemo } from "react";

import type { RemixiconComponentType } from "@remixicon/react";
import { iconRegistry } from "@/assets/icons/iconRegistry";

type IconPickerProps = {
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
};

export const IconPicker: React.FC<IconPickerProps> = ({
  onSelect,
  selectedIcon,
}) => {
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    let icons = Object.keys(iconRegistry).filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );

    if (selectedIcon && !icons.includes(selectedIcon) && search.trim() === "") {
      icons = [selectedIcon, ...icons];
    }

    return icons.slice(0, 100); // limit tetap 100
  }, [search, selectedIcon]);

  const isSearching = search.trim() === "";
  const previousSelectedIconVisible = selectedIcon && isSearching;

  return (
    <div className="p-2 bg-[var(--background)] rounded shadow max-h-[400px] overflow-y-auto w-full">
      <input
        type="text"
        placeholder="Cari icon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-2 p-2 bg-[var(--background)] rounded text-[var(--primary)]"
      />

      <div className="grid grid-cols-6 gap-2">
        {previousSelectedIconVisible && (
          <button
            type="button"
            className={`flex items-center justify-center p-2 rounded hover:bg-[var(--hover)] text-[var(--primary)] bg-[var(--inset)]`}
          >
            {(() => {
              const Icon =
                iconRegistry[selectedIcon as keyof typeof iconRegistry];
              return <Icon size={24} />;
            })()}
          </button>
        )}

        {filteredIcons.map((name) => {
          const Icon = iconRegistry[
            name as keyof typeof iconRegistry
          ] as RemixiconComponentType;
          return (
            <button
              type="button"
              key={name}
              title={name}
              onClick={() => onSelect(name)}
              className={`flex items-center justify-center p-2 rounded hover:bg-[var(--hover)] ${
                selectedIcon === name ? "bg-[var(--inset)]" : ""
              }`}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
