import React, { useState, useMemo } from "react";

import type { RemixiconComponentType } from "@remixicon/react";
import { iconRegistry } from "../../assets/icons/iconRegistry";

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
    return Object.keys(iconRegistry)
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 100); // limit to 100 icons
  }, [search]);

  return (
    <div className="p-2 bg-gray-900 rounded shadow max-h-[400px] overflow-y-auto w-full">
      <input
        type="text"
        placeholder="Cari icon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-2 p-2 bg-gray-800 rounded text-white"
      />

      <div className="grid grid-cols-6 gap-2">
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
              className={`flex items-center justify-center p-2 rounded hover:bg-gray-700 ${
                selectedIcon === name ? "bg-blue-600" : ""
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
