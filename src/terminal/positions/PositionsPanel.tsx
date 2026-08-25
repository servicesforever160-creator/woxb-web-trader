import { useState } from "react";
import { Tab, Tabs } from "@mui/material";
import "./Positions.css";
import { POSITION_TABS, TAB_DATA } from "./positions.data";
import type { PositionTabId, TableData } from "./positions.data";

function getCellClass(value: string, columnName: string) {
  if (columnName === "Type") return value.includes("SELL") ? "cell-negative cell-strong" : "cell-positive cell-strong";
  if (columnName.includes("P/L") || columnName === "Amount") return value.startsWith("-") ? "cell-negative" : "cell-positive";
  if (columnName === "Status") return "cell-status";
  return "";
}

type DataTableProps = {
  data: TableData;
  tabId: PositionTabId;
};

function DataTable({ data, tabId }: DataTableProps) {
  const [cancelledOrders, setCancelledOrders] = useState<string[]>([]);
  const rows = tabId === "orders"
    ? data.rows.filter(([orderId]) => !cancelledOrders.includes(orderId))
    : data.rows;

  return (
    <div className="positions-table-wrap">
      <table className="positions-table">
        <thead>
          <tr>{data.columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((value, index) => {
                const column = data.columns[index];
                const isAction = column === "Action" && value;
                return (
                  <td key={`${column}-${value}`} className={getCellClass(value, column)}>
                    {isAction ? (
                      <button type="button" className="table-action" onClick={() => setCancelledOrders((current) => [...current, row[0]])}>{value}</button>
                    ) : value}
                  </td>
                );
              })}
            </tr>
          ))}
          {!rows.length && <tr><td className="positions-empty" colSpan={data.columns.length}>No pending orders.</td></tr>}
          {data.total && (
            <tr className="positions-total">
              {data.total.map((value, index) => <td key={`${value}-${index}`} className={getCellClass(value, data.columns[index])}>{value}</td>)}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function PositionsPanel() {
  const [activeTab, setActiveTab] = useState<PositionTabId>("positions");
  const activeData = TAB_DATA[activeTab];

  return (
    <section className="positions-panel" aria-label="Trading activity">
      <Tabs
        value={activeTab}
        onChange={(_, nextTab: PositionTabId) => setActiveTab(nextTab)}
        aria-label="Trading activity tabs"
        className="positions-tabs"
        variant="scrollable"
        scrollButtons={false}
        sx={{
          minHeight: 57,
          borderBottom: "1px solid rgba(212, 168, 83, .25)",
          "& .MuiTabs-indicator": { height: 2, backgroundColor: "#D4A853" },
          "& .MuiTabs-list": { gap: "30px" },
          "& .MuiTab-root": {
            minHeight: 57,
            minWidth: 0,
            padding: 0,
            color: "#718092",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            textTransform: "none",
          },
          "& .MuiTab-root.Mui-selected": { color: "#D4A853", fontWeight: 700 },
        }}
      >
        {POSITION_TABS.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            disableRipple
          />
        ))}
      </Tabs>
      <DataTable key={activeTab} data={activeData} tabId={activeTab} />
    </section>
  );
}
