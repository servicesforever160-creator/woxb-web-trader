import { useEffect, useRef, useState } from "react";
import type { MouseEventHandler, ReactNode } from "react";
import {
  ArrowIcon,
  BrushIcon,
  ChevronIcon,
  CrossIcon,
  FibIcon,
  HideAllIcon,
  KeepDrawingIcon,
  LockIcon,
  LongPositionIcon,
  MagnetIcon,
  MeasureIcon,
  ObjectTreeIcon,
  PatternIcon,
  SmileyIcon,
  TextIcon,
  TrashIcon,
  TrendLineIcon,
  ZoomInIcon,
} from "./tools/ToolBarIcons";

type ToolItem = {
  icon: ReactNode;
  label: string;
  dropdown?: boolean;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const TOOL_GROUPS: { items: ToolItem[] }[] = [
  {
    items: [
      { icon: <CrossIcon />, label: "Cross", dropdown: true },
      { icon: <TrendLineIcon />, label: "Trend Line", dropdown: true },
      { icon: <FibIcon />, label: "Fib Retracement", dropdown: true },
      { icon: <PatternIcon />, label: "XABCD Pattern", dropdown: true },
      { icon: <LongPositionIcon />, label: "Long Position", dropdown: true },
      { icon: <BrushIcon />, label: "Brush", dropdown: true },
      { icon: <TextIcon />, label: "Text", dropdown: true },
      { icon: <SmileyIcon />, label: "Icon", dropdown: true },
    ],
  },
  {
    items: [
      { icon: <MeasureIcon />, label: "Measure" },
      { icon: <ZoomInIcon />, label: "Zoom In" },
    ],
  },
  {
    items: [
      { icon: <MagnetIcon />, label: "Magnet Mode", dropdown: true, active: true },
      { icon: <KeepDrawingIcon />, label: "Keep drawing" },
      { icon: <LockIcon />, label: "Lock all drawings" },
      { icon: <HideAllIcon />, label: "Hide all drawings", dropdown: true },
    ],
  },
  {
    items: [{ icon: <TrashIcon />, label: "Remove drawings", dropdown: true }],
  },
];

const OBJECT_TREE_GROUP: { items: ToolItem[] } = {
  items: [{ icon: <ObjectTreeIcon />, label: "Show Object Tree" }],
};

export default function ChartToolbar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollButtons = () => {
    const toolbar = scrollRef.current;
    if (!toolbar) return;

    setCanScrollUp(toolbar.scrollTop > 1);
    setCanScrollDown(
      toolbar.scrollTop + toolbar.clientHeight < toolbar.scrollHeight - 1,
    );
  };

  useEffect(() => {
    const toolbar = scrollRef.current;
    if (!toolbar) return;

    updateScrollButtons();
    toolbar.addEventListener("scroll", updateScrollButtons, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(toolbar);

    return () => {
      toolbar.removeEventListener("scroll", updateScrollButtons);
      resizeObserver.disconnect();
    };
  }, []);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ top: amount, behavior: "smooth" });
  };

  return (
    <div className="group/chart-toolbar relative flex h-full min-h-0 w-16 shrink-0 flex-col overflow-hidden bg-[var(--terminal-card)] border-r border-[var(--terminal-border)]">

      <div
        ref={scrollRef}
        className="flex flex-col flex-1 min-h-0 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:hidden"
      >
        {TOOL_GROUPS.map((group, gi) => (
          <div key={gi} className="flex flex-col items-center border-b border-[var(--terminal-border)] py-0.5">
            {group.items.map((item, i) => (
              <ToolbarButton key={i} {...item} />
            ))}
          </div>
        ))}
        <div className="flex flex-col items-center py-0.5">
          {OBJECT_TREE_GROUP.items.map((item, i) => (
          <ToolbarButton key={i} {...item} />
          ))}
        </div>
      </div>

      {canScrollUp && <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center bg-gradient-to-b from-[var(--terminal-card)] to-transparent pb-3 opacity-0 transition-opacity group-hover/chart-toolbar:pointer-events-auto group-hover/chart-toolbar:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
        <ScrollButton direction="up" onClick={() => scrollBy(-150)} />
      </div>}

      {canScrollDown && <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-[var(--terminal-card)] to-transparent pt-3 opacity-0 transition-opacity group-hover/chart-toolbar:pointer-events-auto group-hover/chart-toolbar:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
        <ScrollButton direction="down" onClick={() => scrollBy(150)} />
      </div>}
    </div>
  );
}

type ScrollButtonProps = {
  direction: "up" | "down";
  onClick: MouseEventHandler<HTMLButtonElement>;
};

function ScrollButton({ direction, onClick }: ScrollButtonProps) {
  const isDown = direction === "down";

  return (
    <button
      title={`Scroll tools ${direction}`}
      aria-label={`Scroll tools ${direction}`}
      onClick={onClick}
      className={`
        ${isDown ? "tools-arrow-down" : "tools-arrow-up"}
        flex h-5 w-14 items-center justify-center
        text-[var(--terminal-muted-text)] transition bg-[var(--terminal-muted)] hover:text-[var(--terminal-text)]
      `}
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function ToolbarButton({ icon, label, dropdown, active, onClick }: ToolItem) {
  return (
    <div className="group/tool relative flex items-center">
      <button
        title={label}
        aria-label={label}
        onClick={onClick}
        className={`
          tool-bar-icons
          h-12
          w-12
          flex
          items-center
          justify-center
          [&>svg]:!h-[26px]
          [&>svg]:!w-[26px]
          transition
          ${active ? "text-[var(--terminal-text)] bg-[var(--terminal-muted)]" : "text-[var(--terminal-muted-text)] hover:text-[var(--terminal-text)] hover:bg-[var(--terminal-muted)]"}
        `}
      >
        {icon}
      </button>

      {dropdown && (
        <button
          aria-label={`${label} options`}
          className="pointer-events-none absolute right-0 top-0 bottom-0 flex w-3.5 items-center justify-center text-[var(--terminal-muted-text)] opacity-0 transition-opacity group-hover/tool:pointer-events-auto group-hover/tool:opacity-100 hover:text-[var(--terminal-text)]"
        >
          <ArrowIcon />
        </button>
      )}
    </div>
  );
}
