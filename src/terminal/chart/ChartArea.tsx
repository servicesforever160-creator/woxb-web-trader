
import "./ChartArea.css"
import ChartHeader from "./ChartHeader";
import ChartToolbar from "./ChartToolbar";
import TradingChart from "./TradingChart";
import type { Theme } from "../hooks/useTheme";

export default function ChartArea({ theme }: { theme: Theme }) {
  return (
    <div className="chart-container">

      <ChartHeader />

      <div className="chart-body">

        <ChartToolbar />

        <TradingChart theme={theme} />
      </div>

    </div>
  );
}
