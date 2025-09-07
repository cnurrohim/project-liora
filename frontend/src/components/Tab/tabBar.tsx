import { useEffect, useRef, useState } from "react";
import { TabController } from "./controller";
import { useController } from "@/hooks/useController";
import { UserPreferencesController } from "@/controller/UserPreferencesController";

type TabBarProps = {
  iconRenderer?: (iconName?: string, iconSize?: number) => React.ReactNode;
};

export default function TabBar({ iconRenderer }: TabBarProps) {
  const tabList = useController(TabController, (s) => s.openTabs);
  const activeTabKey = useController(TabController, (s) => s.activeTabKey);

  const scrollRef = useRef<HTMLDivElement>(null);
  const leftBtnRef = useRef<HTMLButtonElement>(null);
  const rightBtnRef = useRef<HTMLButtonElement>(null);

  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setShowArrows(el.scrollWidth > el.clientWidth);
      if (leftBtnRef.current && rightBtnRef.current) {
        leftBtnRef.current.disabled = el.scrollLeft <= 0;
        rightBtnRef.current.disabled =
          el.scrollLeft + el.clientWidth >= el.scrollWidth;
      }
    };

    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    checkScroll();

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [tabList.length]);

  useEffect(() => {
    if (!activeTabKey) return;

    const el = scrollRef.current;
    if (!el) return;

    const activeButton = el.querySelector(`[data-key="${activeTabKey}"]`);
    if (activeButton instanceof HTMLElement) {
      activeButton.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [activeTabKey]);

  return (
    <div className="flex items-center bg-[var(--horizontal-surface)] ">
      {showArrows && (
        <button
          ref={leftBtnRef}
          className="px-2 text-xl text-[var(--accent-primary)]"
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -100, behavior: "smooth" })
          }
        >
          ‹
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar flex-1 h-12 items-stretch p-2 gap-1"
      >
        {tabList.map((tab) => (
          <div
            key={tab.key}
            className={`tab-wrapper flex items-center group hover:bg-[var(--horizontal-surface-hover)] hover:rounded-3xl ${
              tab.key === activeTabKey
                ? "bg-[var(--horizontal-surface-hover)] text-[var(--horizontal-text)] rounded-3xl"
                : "bg-[var(--horizontal-surface)] text-[var(--horizontal-text)] hover:bg-[--horizontal-surface)]"
            }`}
          >
            <button
              data-key={tab.key}
              onClick={() => TabController.setActiveTab(tab.key)}
              className={`tab transition-all duration-200 ease-in-out h-full px-4 py-1 text-sm whitespace-nowrap flex items-center gap-x-2`}
            >
              <span
                className={`${
                  tab.key === activeTabKey
                    ? "text-[var(--horizontal-text)]"
                    : "text-[var(--horizontal-text-muted)]"
                }`}
              >
                {tab.icon ? iconRenderer?.(tab.icon) ?? "🗱" : "🗱"}
              </span>
              <span
                className={`${
                  tab.key === activeTabKey
                    ? "text-[var(--horizontal-text)]"
                    : "text-[var(--horizontal-text-muted)]"
                }`}
              >
                {tab.label}
              </span>
            </button>

            <button
              onClick={() => TabController.closeTab(tab.key)}
              className={`mr-2 text-lg ${
                tab.key === activeTabKey
                  ? "text-[var(--horizontal-text)]"
                  : "text-[var(--horizontal-text-muted)]"
              }
                 cursor-pointer`}
            >
              {iconRenderer?.("RiCloseFill")}
            </button>
          </div>
        ))}
      </div>

      {showArrows && (
        <button
          ref={rightBtnRef}
          className="px-2 text-xl text-[var(--accent-primary)]"
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 100, behavior: "smooth" })
          }
        >
          ›
        </button>
      )}

      <button
        onClick={() => {
          const defaultTab = UserPreferencesController.get("defaultNewTab");

          TabController.openTab({
            key: `tab-${Date.now()}`,
            label: "New Tab",
            route: defaultTab ?? "/pages/default",
          });
        }}
        className=" h-12 w-12 cursor-pointer flex items-center justify-center 
        text-[var(--accent-primary)] 
        hover:text-[var(--accent-highlight)]"
      >
        {iconRenderer?.("RiAddCircleFill", 23)}
      </button>
    </div>
  );
}
