import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
import { RiArrowDownLine, RiSettings3Line, RiHistoryLine } from "react-icons/ri";
import { useQubicConnect } from "@/wallet/qubic/QubicConnectContext";
import { useToast } from "@/core/toasts/hooks/useToast";
import { ToastIds } from "@/core/toasts/toasts.types";
import { WalletAccount } from "@/wallet/components/WalletAccount";
import { swapService } from "../services/SwapService";
import styles from "./SwapPage.module.scss";

// Mock Token List (Metadata only)
const TOKENS = [
  { symbol: "QUBIC", name: "Qubic", icon: "/qubic-logo.png" },
  { symbol: "USDT", name: "Tether USD", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" },
  { symbol: "CFB", name: "Qubic CFB", icon: "https://pbs.twimg.com/profile_images/1765103261481/CFB_400x400.jpg" },
  { symbol: "QTRY", name: "Qubic Lira", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/28206.png" },
];

export function SwapPage() {
  const { wallet, connected, getBalance, getTick, signTransaction, broadcastTx } = useQubicConnect();
  const { createToast } = useToast.getState();

  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<Record<string, number>>({});

  // Fetch Balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (connected && wallet?.publicKey) {
        try {
          // 1. Fetch Real QUBIC Balance
          const qubicData = await getBalance(wallet.publicKey);

          // 2. Fetch/Mock Other Balances (Simulated persistence)
          const storedBalances = JSON.parse(localStorage.getItem(`balances_${wallet.publicKey}`) || "{}");

          setBalances({
            QUBIC: qubicData.balance,
            USDT: storedBalances.USDT || 1000, // Default mock for testing
            CFB: storedBalances.CFB || 50000,
            QTRY: storedBalances.QTRY || 0,
          });
        } catch (error) {
          console.error("Failed to fetch balances:", error);
        }
      } else {
        setBalances({});
      }
    };

    fetchBalances();
    // Poll for updates
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [connected, wallet, getBalance]);

  const handleSwap = async () => {
    if (!connected || !wallet) {
      createToast(ToastIds.ALERT, {
        title: "Wallet Not Connected",
        message: "Please connect your wallet to swap.",
        type: "error",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) return;

    const currentBalance = balances[fromToken.symbol] || 0;
    if (parseFloat(amount) > currentBalance) {
      createToast(ToastIds.ALERT, {
        title: "Insufficient Balance",
        message: `You don't have enough ${fromToken.symbol}.`,
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Get Network Tick
      const tick = await getTick();

      // 2. Calculate Min Amount Out (Slippage protection)
      const rate = getExchangeRate(fromToken.symbol, toToken.symbol);
      const expectedOut = parseFloat(amount) * rate;
      const minAmountOut = expectedOut * 0.99; // 1% Slippage

      // 3. Prepare Transaction
      const txData = await swapService.prepareSwapTransaction(
        wallet.publicKey,
        {
          assetIn: fromToken.symbol,
          assetOut: toToken.symbol,
          amountIn: parseFloat(amount),
          minAmountOut: minAmountOut,
        },
        tick,
      );

      // 4. Sign Transaction (Real Wallet Interaction)
      // Note: We need to construct the full transaction object/array expected by signTransaction
      // For now, we'll use a simplified flow assuming we have a helper or need to construct the binary manually.
      // Since prepareSwapTransaction returns a data object, we need to convert it to the Uint8Array format
      // that signTransaction expects.

      // However, looking at QubicConnectContext, signTransaction expects a Uint8Array.
      // We need a way to build the full Tx binary from the `txData` object.
      // PerpService has `buildTransaction` but it's not exported or static.
      // Let's import `perpService` to use its builder.

      const { perpService } = await import("../services/PerpService");
      const unsignedTx = perpService.buildTransaction(txData);

      const signedTx = await signTransaction(unsignedTx);

      // 5. Broadcast Transaction
      const result = await broadcastTx(signedTx);

      if (result.success) {
        createToast(ToastIds.ALERT, {
          title: "Transaction Submitted",
          message: "Swap transaction broadcasted to Qubic Network.",
          type: "success",
        });

        // Optimistic Update (Local Simulation)
        const newBalances = { ...balances };
        newBalances[fromToken.symbol] -= parseFloat(amount);
        newBalances[toToken.symbol] = (newBalances[toToken.symbol] || 0) + expectedOut;

        setBalances(newBalances);
        localStorage.setItem(`balances_${wallet.publicKey}`, JSON.stringify(newBalances));

        setAmount("");
      } else {
        throw new Error("Broadcast failed");
      }
    } catch (error) {
      console.error("Swap failed:", error);
      createToast(ToastIds.ALERT, {
        title: "Swap Failed",
        message: error instanceof Error ? error.message : "Transaction failed.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getExchangeRate = (from: string, to: string) => {
    // Mock Rates
    const rates: Record<string, number> = {
      "QUBIC-USDT": 0.0000073,
      "USDT-QUBIC": 136986,
      "QUBIC-CFB": 0.5,
      "CFB-QUBIC": 2,
      // Add more pairs
    };
    const key = `${from}-${to}`;
    return rates[key] || 1;
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const quote = amount ? (parseFloat(amount) * getExchangeRate(fromToken.symbol, toToken.symbol)).toFixed(6) : "0.00";

  return (
    <div className={styles.container}>
      <div className={styles.swapCard}>
        <div className={styles.header}>
          <h2>Swap</h2>
          <div className={styles.actions}>
            <button className={styles.iconBtn}>
              <RiHistoryLine />
            </button>
            <button className={styles.iconBtn}>
              <RiSettings3Line />
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.labelRow}>
            <span>You pay</span>
            <span className={styles.balance}>Balance: {balances[fromToken.symbol]?.toLocaleString() || 0}</span>
          </div>
          <div className={styles.inputRow}>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className={styles.tokenBadge}>
              <img src={fromToken.icon} alt={fromToken.symbol} />
              <span>{fromToken.symbol}</span>
            </div>
          </div>
        </div>

        <div className={styles.switchContainer}>
          <button className={styles.switchBtn} onClick={switchTokens}>
            <RiArrowDownLine />
          </button>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.labelRow}>
            <span>You receive</span>
            <span className={styles.balance}>Balance: {balances[toToken.symbol]?.toLocaleString() || 0}</span>
          </div>
          <div className={styles.inputRow}>
            <input type="text" placeholder="0.00" value={quote} readOnly className={styles.readOnly} />
            <div className={styles.tokenBadge}>
              <img src={toToken.icon} alt={toToken.symbol} />
              <span>{toToken.symbol}</span>
            </div>
          </div>
        </div>

        {connected ? (
          <button className={styles.swapBtn} onClick={handleSwap} disabled={loading || !amount}>
            {loading ? "Swapping..." : "Swap"}
          </button>
        ) : (
          <div className={styles.connectWrapper}>
            <WalletAccount />
          </div>
        )}

        <div className={styles.rateInfo}>
          <span>
            1 {fromToken.symbol} ≈ {getExchangeRate(fromToken.symbol, toToken.symbol)} {toToken.symbol}
          </span>
          <span className={styles.gas}>Network Cost: ~0 QUBIC</span>
        </div>
      </div>
    </div>
  );
}
