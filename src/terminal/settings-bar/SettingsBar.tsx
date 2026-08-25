import { AlarmClock, CalendarDays, Menu, Settings } from "lucide-react";
import "./SettingsBar.css"

const NAV_ITEMS = [
  { id: "market-watch", label: "Market Watch", icon: Menu },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "alarm", label: "Alarm", icon: AlarmClock },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type TerminalTab = (typeof NAV_ITEMS)[number]["id"];

type SettingsBarProps = {
  activeTab: TerminalTab;
  onTabChange: (tab: TerminalTab) => void;
};

export default function SettingsBar({ activeTab, onTabChange }: SettingsBarProps) {
  return (
    <nav className="settings-bar-panel" aria-label="Terminal tools">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`settings-nav-icon${activeTab === id ? " active" : ""}`}
          type="button"
          aria-label={label}
          aria-pressed={activeTab === id}
          title={label}
          onClick={() => onTabChange(id)}
        >
          <Icon aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
