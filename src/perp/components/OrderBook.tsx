import { useState, useEffect } from "react";
import styles from "./OrderBook.module.scss";
import { qubicRpc } from "@/wallet/qubic/services/QubicRpcService";
import { perpService } from "@/perp/services/PerpService";

export function OrderBook() {
  const [asks, setAsks] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrderBook = async () => {
      setIsLoading(true);
      try {
        // Function Index 1: Get Order Book
        // Input Type 1: Standard function call input (usually empty or specific params)
        // For this contract, we assume inputType 1 and empty data for getting order book
        const response = await qubicRpc.querySmartContract(1, 1, "");

        if (response && response.responseData) {
          const orders = perpService.decodeOrderBookResponse(response.responseData);

          // Separate Bids and Asks
          // Assuming type 0 = Buy (Bid), 1 = Sell (Ask) based on QubicPerp.h
          const newBids = orders.filter((o) => o.side === "LONG").sort((a, b) => b.price - a.price);
          const newAsks = orders.filter((o) => o.side === "SHORT").sort((a, b) => a.price - b.price);

          setBids(newBids);
          setAsks(newAsks);
        }
      } catch (error) {
        console.error("Failed to fetch order book:", error);
        // Fallback to mock data if fetch fails (for dev/demo purposes)
        // setAsks(generateOrders(15, 100.50, "ask").reverse());
        // setBids(generateOrders(15, 100.40, "bid"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const renderRow = (order: any, type: "ask" | "bid") => {
    const maxTotal = 10000; // Arbitrary max for visualization
    const percentage = Math.min((order.size / maxTotal) * 100, 100);

    return (
      <div key={order.id} className={styles.row}>
        <span className={type === "ask" ? styles.priceAsk : styles.priceBid}>{order.price.toFixed(2)}</span>
        <span className={styles.size}>{order.size.toLocaleString()}</span>
        <div
          className={styles.bg}
          style={{
            width: `${percentage}%`,
            background: type === "ask" ? "rgba(255, 77, 77, 0.12)" : "rgba(0, 230, 118, 0.12)",
          }}
        />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Price (USD)</span>
        <span>Size (QUBIC)</span>
      </div>

      <div className={styles.asks}>
        {asks.length === 0 && !isLoading && <div className={styles.empty}>No Asks</div>}
        {asks.map((order) => renderRow(order, "ask"))}
      </div>

      <div className={styles.spread}>
        <span className={styles.lastPrice}>{bids.length > 0 ? bids[0].price.toFixed(2) : "-.--"}</span>
        <span className={styles.spreadValue}>
          Spread{" "}
          {bids.length > 0 && asks.length > 0
            ? (((asks[0].price - bids[0].price) / bids[0].price) * 100).toFixed(2)
            : "0.00"}
          %
        </span>
      </div>

      <div className={styles.bids}>
        {bids.length === 0 && !isLoading && <div className={styles.empty}>No Bids</div>}
        {bids.map((order) => renderRow(order, "bid"))}
      </div>
    </div>
  );
}
