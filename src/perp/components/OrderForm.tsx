import { useState, useEffect } from "react";
import { usePerpStore } from "../store/perpStore";
import { useQubicConnect } from "@/wallet/qubic/QubicConnectContext";
import { perpService } from "../services/PerpService";
import { useToast } from "@/core/toasts/hooks/useToast";
import { ToastIds } from "@/core/toasts/toasts.types";
import styles from "./OrderForm.module.scss";

export function OrderForm() {
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [side, setSide] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState(5);
  const [amount, setAmount] = useState(100);
  const [collateralToken, setCollateralToken] = useState("QUBIC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TP/SL State
  const [enableTPSL, setEnableTPSL] = useState(false);
  const [takeProfit, setTakeProfit] = useState<number | undefined>(undefined);
  const [stopLoss, setStopLoss] = useState<number | undefined>(undefined);

  const addPosition = usePerpStore((state) => state.addPosition);
  const price = usePerpStore((state) => state.price);
  const storeBalance = usePerpStore((state) => state.balance);
  const setStoreBalance = usePerpStore((state) => state.setBalance);
  const selectedPair = usePerpStore((state) => state.selectedPair);

  const { wallet, getBalance, getTick, signTransaction, broadcastTx } = useQubicConnect();
  const { createToast } = useToast();
  const [displayBalance, setDisplayBalance] = useState(storeBalance);

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet?.publicKey) {
        try {
          const bal = await getBalance(wallet.publicKey);
          if (bal && typeof bal.balance === "number") {
            setStoreBalance(bal.balance);
            setDisplayBalance(bal.balance);
          }
        } catch (e) {
          console.error("Failed to fetch balance", e);
        }
      } else {
        setDisplayBalance(storeBalance);
      }
    };
    fetchBalance();
  }, [wallet, getBalance, storeBalance, setStoreBalance]);

  const handleBuy = async () => {
    if (!wallet?.publicKey) {
      createToast(ToastIds.ALERT, {
        title: "Wallet Not Connected",
        message: "Please connect your wallet to place an order.",
        type: "error",
      });
      return;
    }

    // Insufficient Funds Check
    if (collateralToken === "QUBIC" && amount > displayBalance) {
      createToast(ToastIds.ALERT, {
        title: "Insufficient Funds",
        message: `You need ${amount.toLocaleString()} QUBIC but only have ${displayBalance.toLocaleString()} QUBIC.`,
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare Transaction Data
      const currentTick = await getTick();
      const txData = await perpService.prepareOrderTransaction(
        wallet.publicKey,
        {
          symbol: selectedPair,
          side: side === "long" ? "LONG" : "SHORT",
          size: amount,
          price: price,
          leverage: leverage,
          type: orderType === "limit" ? "LIMIT" : "MARKET",
          collateralToken: collateralToken,
          takeProfit: enableTPSL ? takeProfit : undefined,
          stopLoss: enableTPSL ? stopLoss : undefined,
        },
        currentTick,
      );

      console.log("📝 Signing Order Transaction...", txData);

      // 2. Build Transaction
      const txBuffer = perpService.buildTransaction(txData);

      // 3. Sign Transaction (Triggers Wallet/Snap)
      const signedTx = await signTransaction(txBuffer);

      console.log("✅ Transaction Signed:", signedTx);

      // 3. Broadcast
      const broadcastResult = await broadcastTx(signedTx);
      console.log("📡 Broadcast Result:", broadcastResult);

      if (!broadcastResult.success) {
        throw new Error("Failed to broadcast transaction");
      }

      // 4. Optimistic UI Update
      // Deduct balance immediately for better UX
      const newBalance = displayBalance - amount;
      setStoreBalance(newBalance);
      setDisplayBalance(newBalance);

      addPosition({
        id: Math.random().toString(36).substr(2, 9),
        symbol: selectedPair,
        side: side === "long" ? "LONG" : "SHORT",
        size: amount,
        leverage,
        entryPrice: price,
        pnl: 0,
      });

      createToast(ToastIds.ALERT, {
        title: "Order Placed Successfully",
        message: `${side.toUpperCase()} ${amount} ${collateralToken} @ ${price.toFixed(2)}`,
        type: "success",
      });
    } catch (error) {
      console.error("Order failed:", error);
      createToast(ToastIds.ALERT, {
        title: "Order Failed",
        message: error instanceof Error ? error.message : "Failed to sign or broadcast transaction.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Main Side Tabs (Long/Short) */}
      <div className={styles.mainTabs}>
        <button className={`${styles.tab} ${side === "long" ? styles.activeLong : ""}`} onClick={() => setSide("long")}>
          Long / Buy
        </button>
        <button
          className={`${styles.tab} ${side === "short" ? styles.activeShort : ""}`}
          onClick={() => setSide("short")}
        >
          Short / Sell
        </button>
      </div>

      {/* Order Type Tabs */}
      <div className={styles.orderTypeTabs}>
        <button className={orderType === "market" ? styles.active : ""} onClick={() => setOrderType("market")}>
          Market
        </button>
        <button className={orderType === "limit" ? styles.active : ""} onClick={() => setOrderType("limit")}>
          Limit
        </button>
      </div>

      <div className={styles.content}>
        {/* You're Paying Section */}
        <div className={styles.paymentSection}>
          <div className={styles.labelRow}>
            <label>You're paying</label>
            <span className={styles.balance}>
              <span className={styles.icon}>💼</span> {displayBalance.toLocaleString()}
            </span>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.tokenSelector}>
              <select value={collateralToken} onChange={(e) => setCollateralToken(e.target.value)}>
                <option value="QUBIC">QUBIC</option>
                <option value="CFB">CFB</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={styles.amountInput}
            />
          </div>
        </div>

        {/* Leverage Slider */}
        <div className={styles.leverageContainer}>
          <div className={styles.labelRow}>
            <label>Leverage</label>
            <span className={styles.leverageValue}>{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className={styles.slider}
            style={{
              background: `linear-gradient(to right, ${side === "long" ? "#00e676" : "#ff5252"} 0%, ${side === "long" ? "#00e676" : "#ff5252"} ${(leverage / 100) * 100}%, #333 ${(leverage / 100) * 100}%, #333 100%)`,
            }}
          />
          <div className={styles.marks}>
            <span>1.1x</span>
            <span>50x</span>
            <span>100x</span>
          </div>
        </div>

        {/* TP/SL Section (Market Only) */}
        {orderType === "market" && (
          <div className={styles.tpslSection}>
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="tpsl-check"
                checked={enableTPSL}
                onChange={(e) => setEnableTPSL(e.target.checked)}
              />
              <label htmlFor="tpsl-check">Take Profit / Stop Loss</label>
            </div>

            {enableTPSL && (
              <div className={styles.tpslInputs}>
                <div className={styles.inputGroup}>
                  <label>Take Profit</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={takeProfit || ""}
                    onChange={(e) => setTakeProfit(Number(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Stop Loss</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={stopLoss || ""}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.row}>
            <span>Entry Price</span>
            <span>{price.toFixed(2)} USD</span>
          </div>
          <div className={styles.row}>
            <span>Liquidation Price</span>
            <span>{(side === "long" ? price * 0.8 : price * 1.2).toFixed(2)} USD</span>
          </div>
          <div className={styles.row}>
            <span>Slippage</span>
            <span>Max: 1%</span>
          </div>
          <div className={styles.row}>
            <span>Fees</span>
            <span>0.05%</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className={`${styles.submitBtn} ${side === "long" ? styles.longBtn : styles.shortBtn}`}
          onClick={handleBuy}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing..." : side === "long" ? "Long / Buy" : "Short / Sell"}
        </button>
      </div>
    </div>
  );
}
