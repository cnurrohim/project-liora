import { useState, useEffect } from "react";

type Option = {
  id: string;
  name: string;
  data?: Record<string, any>;
};

type SearchSelectProps = {
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  disabled?: boolean;
  fetchOptions: (term: string) => Promise<Option[]>; // fungsi fetch dari luar
};

export default function SearchSelect({
  value,
  onChange,
  placeholder = "Cari...",
  disabled = false,
  fetchOptions,
}: SearchSelectProps) {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (input.length < 2) {
      setOptions([]);
      return;
    }
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetchOptions(input);
        if (active) setOptions(result);
      } catch (err) {
        console.error("SearchSelect fetch error:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [input, fetchOptions]);

  const selectOption = (opt: Option) => {
    onChange(opt);
    setInput(""); // kosongkan input
    setIsOpen(false); // tutup dropdown
  };

  const clearOption = () => {
    onChange(null);
    setInput("");
  };

  return (
    <div className="p-2 relative w-full">
      <input
        value={value ? value.name : input}
        onChange={(e) => {
          setInput(e.target.value);
          if (value) onChange(null); // reset kalau user edit lagi
        }}
        className="w-full outline-none"
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // Cegah submit form saat tekan Enter
          }
        }}
      />

      {value && !disabled && (
        <button
          type="button"
          onClick={clearOption}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 cursor-pointer"
        >
          ×
        </button>
      )}

      {isOpen && (
        <ul className="absolute left-0 right-0 z-10 mt-1 bg-gray-900 rounded shadow max-h-60 overflow-auto">
          {loading ? (
            <li className="px-2 py-1 text-gray-400">Loading...</li>
          ) : options.length > 0 ? (
            options.map((opt) => (
              <li
                key={opt.id}
                className="px-2 py-1 hover:bg-gray-950 cursor-pointer"
                onMouseDown={() => selectOption(opt)}
              >
                {opt.name}
              </li>
            ))
          ) : (
            <li className="px-2 py-1 text-gray-400">Tidak ada hasil</li>
          )}
        </ul>
      )}
    </div>
  );
}
