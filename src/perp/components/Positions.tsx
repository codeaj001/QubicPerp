import { useState } from "react";
import { usePerpStore } from "../store/perpStore";
import styles from "./Positions.module.scss";

export function Positions() {
  const positions = usePerpStore((state) => state.positions);
  const history = usePerpStore((state) => state.history);
  const currentPrice = usePerpStore((state) => state.price);
  const closePosition = usePerpStore((state) => state.closePosition);
  const [activeTab, setActiveTab] = useState<"positions" | "orders" | "history" | "ai_logs">("positions");

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button className={activeTab === "positions" ? styles.active : ""} onClick={() => setActiveTab("positions")}>
          Positions ({positions.length})
        </button>
        <button className={activeTab === "orders" ? styles.active : ""} onClick={() => setActiveTab("orders")}>
          Open Orders (0)
        </button>
        <button className={activeTab === "history" ? styles.active : ""} onClick={() => setActiveTab("history")}>
          Order History
        </button>
        <button
          className={`${activeTab === "ai_logs" ? styles.active : ""} ${styles.aiTab}`}
          onClick={() => setActiveTab("ai_logs")}
        >
          AI Hedge Logs
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "positions" && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Size</th>
                <th>Leverage</th>
                <th>Entry Price</th>
                <th>Mark Price</th>
                <th>Liq. Price</th>
                <th>PnL (ROE%)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.empty}>
                    No active positions
                  </td>
                </tr>
              ) : (
                positions.map((pos) => {
                  const positionSize = pos.size * pos.leverage;
                  const markPrice = currentPrice; // Use global store price
                  const liqPrice =
                    pos.side === "LONG"
                      ? pos.entryPrice * (1 - 1 / pos.leverage)
                      : pos.entryPrice * (1 + 1 / pos.leverage);

                  // PnL % = (PnL / CollateralValue) * 100
                  // CollateralValue = pos.size * pos.entryPrice
                  const pnlPercent = (pos.pnl / (pos.size * pos.entryPrice)) * 100;

                  return (
                    <tr key={pos.id}>
                      <td className={styles.symbol}>{pos.symbol}</td>
                      <td className={pos.side === "LONG" ? styles.long : styles.short}>{pos.side}</td>
                      <td>{positionSize.toLocaleString()} QUBIC</td>
                      <td>{pos.leverage}x</td>
                      <td>{pos.entryPrice.toFixed(4)}</td>
                      <td>{markPrice.toFixed(4)}</td>
                      <td>{liqPrice.toFixed(4)}</td>
                      <td className={pos.pnl >= 0 ? styles.profit : styles.loss}>
                        {pos.pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                      </td>
                      <td>
                        <button className={styles.closeButton} onClick={() => closePosition(pos.id)}>
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === "history" && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Size</th>
                <th>Leverage</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>Realized PnL</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    No order history
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                    <td className={styles.symbol}>{entry.symbol}</td>
                    <td className={entry.side === "LONG" ? styles.long : styles.short}>{entry.side}</td>
                    <td>{entry.size.toLocaleString()} QUBIC</td>
                    <td>{entry.leverage}x</td>
                    <td>{entry.entryPrice.toFixed(4)}</td>
                    <td>{entry.exitPrice.toFixed(4)}</td>
                    <td className={entry.pnl >= 0 ? styles.profit : styles.loss}>{entry.pnl.toFixed(2)} USD</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === "ai_logs" && (
          <div className={styles.logs}>
            <div className={styles.logEntry}>
              <span className={styles.time}>14:32:05</span>
              <span className={styles.action}>AI Auto-Hedge Triggered</span>
              <span className={styles.detail}>Price dropped 2% in 5s. Opened 1x Short Hedge.</span>
            </div>
            <div className={styles.logEntry}>
              <span className={styles.time}>14:30:00</span>
              <span className={styles.info}>Funding Rate Prediction Update</span>
              <span className={styles.detail}>Predicted to drop to 0.005% in 1h.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
