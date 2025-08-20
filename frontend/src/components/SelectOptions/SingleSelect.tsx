import { useState } from "react";

type Option = {
  id: string;
  name: string;
};

type SingleSelectProps = {
  options: Option[];
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function SingleSelect({
  options,
  value = null,
  onChange,
  placeholder = "Pilih...",
  disabled = false,
}: SingleSelectProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = options.filter((opt) =>
    opt.name.toLowerCase().includes(input.toLowerCase())
  );

  const selectOption = (opt: Option) => {
    onChange(opt);
    setInput("");
    setIsOpen(false);
  };

  const clearOption = () => {
    onChange(null);
    setInput("");
  };

  return (
    <div className="p-2 relative w-full">
      {value && (
        <div className="flex items-center gap-1 mb-1 w-full">
          <span className=" text-gray-300 px-2 py-1 rounded text-sm w-full flex justify-between">
            {value.name}
            {!disabled && (
              <button
                type="button"
                onClick={clearOption}
                className="text-red-500 cursor-pointer"
              >
                ×
              </button>
            )}
          </span>
        </div>
      )}
      {!value && (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full outline-none"
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        />
      )}
      {isOpen && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 z-10 mt-1 bg-gray-900 rounded shadow max-h-60 overflow-auto">
          {filtered.map((opt) => (
            <li
              key={opt.id}
              className="px-2 py-1 hover:bg-gray-950 cursor-pointer"
              onMouseDown={() => selectOption(opt)}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
      {isOpen && filtered.length === 0 && (
        <ul className="absolute left-0 right-0 z-10 mt-1 bg-gray-900 rounded shadow">
          <li className="px-2 py-1 text-gray-400">Tidak ada opsi</li>
        </ul>
      )}
    </div>
  );
}
