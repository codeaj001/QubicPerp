import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { usePerpStore } from "../store/perpStore";

export function TradingChart() {
  const theme = "dark"; // Force dark theme
  const selectedPair = usePerpStore((state) => state.selectedPair);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "500px" }}>
      <AdvancedRealTimeChart
        theme={theme}
        symbol={selectedPair}
        autosize
        hide_side_toolbar={false}
        allow_symbol_change={true}
        container_id="tradingview_widget"
        watchlist={["MEXC:QUBICUSDT", "GATEIO:QUBICUSDT", "BITGET:QUBICUSDT"]}
      />
    </div>
  );
}
