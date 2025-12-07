import { useState, useEffect } from "react";
import { RiRefreshLine, RiMagicLine } from "react-icons/ri";
import { useQubicConnect } from "@/wallet/qubic/QubicConnectContext";
import { useToast } from "@/core/toasts/hooks/useToast";
import { ToastIds } from "@/core/toasts/toasts.types";
import { predictionService, Market } from "../services/PredictionService";
import { swapService } from "../services/SwapService"; // Reuse for transaction building
import styles from "./PredictPage.module.scss";

export function PredictPage() {
  const { wallet, connected, getTick, signTransaction, broadcastTx } = useQubicConnect();
  const { createToast } = useToast.getState();

  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const [userBets, setUserBets] = useState<Record<string, "YES" | "NO">>(() => {
    // Load initial bets from local storage if wallet is connected
    // Note: We can't access wallet here easily in initial state, so we'll load in useEffect
    return {};
  });

  useEffect(() => {
    if (connected && wallet?.publicKey) {
      const storedBets = localStorage.getItem(`bets_${wallet.publicKey}`);
      if (storedBets) {
        setUserBets(JSON.parse(storedBets));
      } else {
        setUserBets({});
      }
    } else {
      setUserBets({});
    }
  }, [connected, wallet]);

  useEffect(() => {
    loadMarkets();
  }, []);

  // Auto-resolve expired markets
  useEffect(() => {
    if (markets.length > 0) {
      markets.forEach((market) => {
        const isExpired = new Date(market.endDate) <= new Date();
        if (isExpired && !market.resolved && resolving !== market.id) {
          handleResolve(market);
        }
      });
    }
  }, [markets]);

  const loadMarkets = async () => {
    setLoading(true);
    const data = await predictionService.generateMarkets();
    setMarkets(data);
    setLoading(false);
  };

  const handleBet = async (market: Market, prediction: "YES" | "NO") => {
    if (!connected || !wallet) {
      createToast(ToastIds.ALERT, {
        title: "Connect Wallet",
        message: "Please connect your wallet to place a bet.",
        type: "error",
      });
      return;
    }

    if (userBets[market.id]) {
      createToast(ToastIds.ALERT, {
        title: "Already Predicted",
        message: `You have already predicted ${userBets[market.id]} for this market.`,
        type: "error",
      });
      return;
    }

    try {
      // 1. Get Tick
      const tick = await getTick();

      // 2. Prepare Transaction (Using Echo/Swap as proxy for betting on Testnet)
      // In a real scenario, this would call Procedure 5 (Predict)
      // For Hackathon Demo on Shared Node, we use Procedure 1 (Echo) to simulate on-chain activity
      const txData = await swapService.prepareSwapTransaction(
        wallet.publicKey,
        {
          assetIn: "QUBIC",
          assetOut: "QUBIC", // Echo back
          amountIn: 1000, // Fixed bet amount for demo
          minAmountOut: 0,
        },
        tick,
      );

      // 3. Sign & Broadcast
      const { perpService } = await import("../services/PerpService");
      const unsignedTx = perpService.buildTransaction(txData);
      const signedTx = await signTransaction(unsignedTx);
      const result = await broadcastTx(signedTx);

      if (result.success) {
        createToast(ToastIds.ALERT, {
          title: "Bet Placed!",
          message: `You bet 1000 QUBIC on ${prediction} for "${market.question}"`,
          type: "success",
        });

        // Save Bet State
        const newBets = { ...userBets, [market.id]: prediction };
        setUserBets(newBets);
        localStorage.setItem(`bets_${wallet.publicKey}`, JSON.stringify(newBets));

        // Optimistic Update
        setMarkets((prev) =>
          prev.map((m) => {
            if (m.id === market.id) {
              return {
                ...m,
                yesPool: prediction === "YES" ? m.yesPool + 1000 : m.yesPool,
                noPool: prediction === "NO" ? m.noPool + 1000 : m.noPool,
              };
            }
            return m;
          }),
        );
      } else {
        throw new Error("Transaction broadcast failed");
      }
    } catch (error) {
      console.error("Betting failed:", error);
      createToast(ToastIds.ALERT, {
        title: "Bet Failed",
        message: "Could not place bet on Qubic Network.",
        type: "error",
      });
    }
  };

  const handleResolve = async (market: Market) => {
    setResolving(market.id);
    try {
      const outcome = await predictionService.resolveMarket(market.question);

      setMarkets((prev) =>
        prev.map((m) => {
          if (m.id === market.id) {
            return { ...m, resolved: true, outcome };
          }
          return m;
        }),
      );

      createToast(ToastIds.ALERT, {
        title: "Market Resolved",
        message: `AI Oracle decided: ${outcome}`,
        type: "success",
      });
    } catch (error) {
      console.error("Resolution failed:", error);
    } finally {
      setResolving(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>AI Prediction Markets</h1>
        <button className={styles.refreshBtn} onClick={loadMarkets} disabled={loading}>
          <RiRefreshLine className={loading ? "spin" : ""} />
          Refresh Markets
        </button>
      </div>

      <div className={styles.grid}>
        {markets.map((market) => {
          const userPrediction = userBets[market.id];

          return (
            <div key={market.id} className={styles.card}>
              <div className={styles.cardImage} style={{ backgroundImage: `url(${market.imageUrl})` }}>
                <span className={styles.category}>{market.category}</span>
                {market.resolved && (
                  <div className={styles.resolvedOverlay}>
                    <span className={styles.result + " " + (market.outcome === "YES" ? styles.yes : styles.no)}>
                      {market.outcome}
                    </span>
                    <span>WINNER</span>
                  </div>
                )}
                {!market.resolved && userPrediction && (
                  <div className={styles.resolvedOverlay} style={{ background: "rgba(19, 23, 34, 0.7)" }}>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>YOU PREDICTED</span>
                    <span className={styles.result + " " + (userPrediction === "YES" ? styles.yes : styles.no)}>
                      {userPrediction}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.cardContent}>
                <h3>{market.question}</h3>

                <div className={styles.poolInfo}>
                  <span>
                    <span style={{ color: "#00e676" }}>YES</span>
                    <span className={styles.value}>{market.yesPool.toLocaleString()} QU</span>
                  </span>
                  <span>
                    <span style={{ color: "#ff5252" }}>NO</span>
                    <span className={styles.value}>{market.noPool.toLocaleString()} QU</span>
                  </span>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.yesBtn}
                    onClick={() => handleBet(market, "YES")}
                    disabled={market.resolved || !!userPrediction}
                    style={userPrediction === "YES" ? { background: "#00e676", color: "#000" } : {}}
                  >
                    {userPrediction === "YES" ? "PREDICTED" : "YES"}
                  </button>
                  <button
                    className={styles.noBtn}
                    onClick={() => handleBet(market, "NO")}
                    disabled={market.resolved || !!userPrediction}
                    style={userPrediction === "NO" ? { background: "#ff5252", color: "#fff" } : {}}
                  >
                    {userPrediction === "NO" ? "PREDICTED" : "NO"}
                  </button>
                </div>

                {/* Admin / AI Oracle Panel - Only show if resolving or expired (though auto-resolve handles expired) */}
                {resolving === market.id && (
                  <div className={styles.adminPanel}>
                    <button disabled>
                      <RiMagicLine /> Consulting AI Oracle...
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
