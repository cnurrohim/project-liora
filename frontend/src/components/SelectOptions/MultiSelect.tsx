import { useState } from "react";

type Option = {
  id: string;
  name: string;
};

type MultiSelectProps = {
  options: Option[];
  value: Option[];
  onChange: (value: Option[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Pilih...",
  disabled = false,
}: MultiSelectProps) {
  const selected = value ?? [];

  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(input.toLowerCase()) &&
      !selected.find((v) => v.id === opt.id)
  );

  const addOption = (opt: Option) => {
    onChange([...selected, opt]);
    setInput("");
    setIsOpen(false);
  };

  const removeOption = (id: string) => {
    onChange(selected.filter((v) => v.id !== id));
  };

  return (
    <div className=" p-2 relative">
      <div className="flex flex-wrap gap-1 mb-1">
        {selected.map((opt) => (
          <span
            key={opt.id}
            className="bg-gray-900 text-gray-300 px-2 py-1 rounded text-sm"
          >
            {opt.name}
            <button
              type="button"
              onClick={() => removeOption(opt.id)}
              className="ml-1 text-red-500 cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full outline-none"
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 z-10 mt-1   bg-gray-900 rounded shadow max-h-60 overflow-auto">
          {filtered.map((opt) => (
            <li
              key={opt.id}
              className="px-2 py-1 hover:bg-gray-950 cursor-pointer"
              onMouseDown={() => addOption(opt)}
            >
              {opt.name}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-2 py-1 text-gray-400">Tidak ada opsi</li>
          )}
        </ul>
      )}
    </div>
  );
}
