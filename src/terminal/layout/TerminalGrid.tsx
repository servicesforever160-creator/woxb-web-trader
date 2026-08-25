import { useState } from "react";
import "../terminal.css";

import { Group, Panel, Separator } from "react-resizable-panels";

import TopBar from "../topbar/TopBar";
import MarketWatch from "../market-watch/MarketWatch";
import ChartArea from "../chart/ChartArea";
import OrderPanel from "../order-panel/OrderPanel";
import PositionsPanel from "../positions/PositionsPanel";
import SettingsBar from "../settings-bar/SettingsBar";
import type { TerminalTab } from "../settings-bar/SettingsBar";
import BottomBar from "../bottom-bar/BottomBar";
import { useTheme } from "../hooks/useTheme";

const TAB_LABELS: Partial<Record<TerminalTab, string>> = {
  calendar: "Calendar",
  alarm: "Alarm",
  settings: "Settings",
};

export default function TerminalGrid() {
  const [activeTab, setActiveTab] = useState<TerminalTab>("market-watch");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`terminal ${theme}`}>
      <div className="topbar">
        <TopBar theme={theme} onThemeToggle={toggleTheme} />
      </div>
      <div className="settings-bar">
        <SettingsBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="market-chart-wrapper">
        <Group orientation="horizontal" className="market-chart-panels">
        <Panel
            defaultSize="300px"
            minSize="120px"
            maxSize="400px"
            collapsible
            collapsedSize={0}
          >
            <div className="market-watch">
              {activeTab === "market-watch" ? (
                <MarketWatch />
              ) : (
                <div className="terminal-tab-placeholder">{TAB_LABELS[activeTab] ?? "Market Watch"}</div>
              )}
            </div>
          </Panel>

          <Separator className="vertical-resize-line" />

          <Panel minSize={45}>
            <div className="chart-wrapper">
              <Group orientation="vertical" className="chart-panels">
                <Panel defaultSize={75} minSize={40}>
                  <div className="chart-panel-content">
                    <ChartArea theme={theme} />
                  </div>
                </Panel>

                <Separator className="resize-line" />

                <Panel defaultSize={25} minSize={10}>
                  <div className="positions-panel-content">
                    <PositionsPanel />
                  </div>
                </Panel>
              </Group>
            </div>
          </Panel>
        </Group>
      </div>
      <div className="order-panel">
        <OrderPanel theme={theme} />
      </div>

      <div className="bottom-bar">
        <BottomBar />
      </div>
    </div>
  );
}
