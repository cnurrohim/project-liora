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
  className?: string;
  disabled?: boolean;
};

export default function SingleSelect({
  options,
  value = null,
  onChange,
  placeholder = "Pilih...",
  className = "w-full outline-none bg-[var(--content-surface-hover)] p-1",
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
    <div className="relative w-full">
      {value && (
        <div className="flex items-center gap-1 mb-1 w-full bg-[var(--content-surface-hover)] ">
          <span className=" text-[var(--content-text)] px-2 py-1 rounded w-full flex justify-between">
            {value.name}
            {!disabled && (
              <button
                type="button"
                onClick={clearOption}
                className="text-[var(--content-text)] cursor-pointer"
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
          className={className}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        />
      )}
      {isOpen && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 z-10 mt-1 bg-[var(--content-surface)] rounded shadow max-h-60 overflow-auto border-1 border-[var(--content-border)]">
          {filtered.map((opt) => (
            <li
              key={opt.id}
              className="px-2 py-1 hover:bg-[var(--content-surface-hover)] cursor-pointer"
              onMouseDown={() => selectOption(opt)}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
      {isOpen && filtered.length === 0 && (
        <ul className="absolute left-0 right-0 z-10 mt-1 bg-[var(--content-surface-hover)] rounded shadow">
          <li className="px-2 py-1 text-[var(--content-text)]">No Option</li>
        </ul>
      )}
    </div>
  );
}
