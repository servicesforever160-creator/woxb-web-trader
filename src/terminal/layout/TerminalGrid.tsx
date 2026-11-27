import { useState } from "react";
import "../terminal.css";

import { Group, Panel, Separator } from "react-resizable-panels";

import TopBar from "../topbar/TopBar";
import type { AccountDetail } from "../topbar/accountDetails";
import MarketWatch from "../market-watch/MarketWatch";
import ChartArea from "../chart/ChartArea";
import OrderPanel from "../order-panel/OrderPanel";
import PositionsPanel from "../positions/PositionsPanel";
import SettingsBar from "../settings-bar/SettingsBar";
import type { TerminalTab } from "../settings-bar/SettingsBar";
import BottomBar from "../bottom-bar/BottomBar";
import { useTradeActions } from "../hooks/useTradeActions";
import { useMarketSocket } from "../hooks/useMarketSocket";
import { useMarketSymbols } from "../hooks/useMarketSymbols";
import { useTheme } from "../hooks/useTheme";
import { useTopbarInstruments } from "../topbar/useTopbarInstruments";

const TAB_LABELS: Partial<Record<TerminalTab, string>> = {
  calendar: "Calendar",
  alarm: "Alarm",
  settings: "Settings",
};

export default function TerminalGrid({
  accountId,
  accountDetails,
}: {
  accountId?: string;
  accountDetails: AccountDetail[];
}) {
  const [activeTab, setActiveTab] = useState<TerminalTab>("market-watch");
  const { theme, toggleTheme } = useTheme();
  const market = useMarketSymbols();
  const { quotes, subscribeToTicks, subscribeToTrades } = useMarketSocket(market.symbols);
  const topbarInstruments = useTopbarInstruments(market.symbols, quotes);
  const { activeSymbol } = topbarInstruments;
  const displaySymbol = market.symbols.find(({ symbol }) => symbol === activeSymbol)?.displaySymbol ?? activeSymbol;
  const trades = useTradeActions();

  return (
    <div className={`terminal ${theme}`}>
      <div className="topbar">
        <TopBar
          accountDetails={accountDetails}
          {...topbarInstruments}
          theme={theme}
          onThemeToggle={toggleTheme}
          subscribeToTicks={subscribeToTicks}
        />
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
                <MarketWatch
                  market={market}
                  quotes={quotes}
                  activeSymbol={activeSymbol}
                  onSelect={topbarInstruments.setActiveSymbol}
                />
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
                    {activeSymbol && (
                      <ChartArea
                        key={activeSymbol}
                        symbol={activeSymbol}
                        displaySymbol={displaySymbol}
                        theme={theme}
                        subscribeToTicks={subscribeToTicks}
                      />
                    )}
                  </div>
                </Panel>

                <Separator className="resize-line" />

                <Panel defaultSize={25} minSize={10}>
                  <div className="positions-panel-content">
                    <PositionsPanel
                      key={accountId}
                      accountId={accountId}
                      subscribeToTrades={subscribeToTrades}
                      busy={trades.busy}
                      onClose={trades.close}
                    />
                  </div>
                </Panel>
              </Group>
            </div>
          </Panel>
        </Group>
      </div>
      <div className="order-panel">
        <OrderPanel
          key={accountId}
          accountId={accountId}
          symbol={activeSymbol}
          displaySymbol={displaySymbol}
          busy={trades.busy}
          onOpen={trades.open}
        />
      </div>

      <div className="bottom-bar">
        <BottomBar />
      </div>
    </div>
  );
}
