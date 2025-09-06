import React from "react";
import { useState, type ReactNode } from "react";

type TabsProps = {
  defaultValue?: string;
  children: ReactNode;
};

type TabsContextType = {
  activeValue: string;
  setActiveValue: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextType | null>(null);

export function Tabs({ defaultValue = "", children }: TabsProps) {
  const [activeValue, setActiveValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: ReactNode }) {
  return <div className="flex mb-4 space-x-2">{children}</div>;
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used inside Tabs");

  const isActive = ctx.activeValue === value;

  return (
    <button
      type="button"
      onClick={() => ctx.setActiveValue(value)}
      className={` px-3 py-1.5 text-sm font-medium rounded-t border-b-1 flex flex-row gap-2 cursor-pointer ${
        isActive
          ? "border-[var(--accent-primary)] text-[var(--primary)]"
          : "border-transparent text-[var(--panel-text-primary)] hover:text-[var(--text-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used inside Tabs");

  return ctx.activeValue === value ? <div>{children}</div> : null;
}
