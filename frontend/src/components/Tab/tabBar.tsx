import { useEffect, useRef, useState } from "react";
import { TabController } from "./controller";
import { useController } from "../../hooks/useController";
import { DefaultPageController } from "../../controller/DefaultPageController";
import DefaultPage from "../../pages/DefaultPage";

export default function TabBar() {
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
    <div className="flex items-center bg-gray-900">
      {showArrows && (
        <button
          ref={leftBtnRef}
          className="px-2 text-xl text-gray-100"
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -100, behavior: "smooth" })
          }
        >
          ‹
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar flex-1 h-10 items-stretch"
      >
        {tabList.map((tab) => (
          <div key={tab.key} className="tab-wrapper relative group">
            <button
              data-key={tab.key}
              onClick={() => TabController.setActiveTab(tab.key)}
              className={`tab transition-all duration-200 ease-in-out h-full px-4 py-1 text-sm whitespace-nowrap pr-6
                ${
                  tab.key === activeTabKey
                    ? "bg-gray-800 text-gray-200 border-t-2 border-rose-400"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-800"
                }
              `}
            >
              <span className="text-rose-400 pr-2">▨</span>
              {tab.label}
            </button>
            <button
              onClick={() => TabController.closeTab(tab.key)}
              className="absolute right-1 h-full text-lg text-rose-400 hover:text-rose-200 cursor-pointer opacity-0 group-hover:opacity-100"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {showArrows && (
        <button
          ref={rightBtnRef}
          className="px-2 text-xl text-gray-100"
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 100, behavior: "smooth" })
          }
        >
          ›
        </button>
      )}

      <button
        onClick={() => {
          const defaultTab = DefaultPageController.getDefaultPage();

          TabController.openTab({
            key: `tab-${Date.now()}`, // selalu unik
            label: defaultTab?.label ?? "New Tab",
            content: defaultTab?.content ?? <DefaultPage />,
          });
        }}
        className="px-2 text-2xl h-10 bg-rose-500 text-gray-900 hover:text-white cursor-pointer"
      >
        +
      </button>
    </div>
  );
}
