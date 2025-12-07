import { create } from "zustand";
import { useToast } from "@/core/toasts/hooks/useToast";
import { ToastIds } from "@/core/toasts/toasts.types";

export interface Position {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  leverage: number;
  entryPrice: number;
  pnl: number;
}

export interface LogEntry {
  time: string;
  type: "action" | "info";
  title: string;
  detail: string;
}

export interface HistoryEntry {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  timestamp: number;
}

interface PerpState {
  price: number;
  fundingRate: number;
  predictedFundingRate: number;
  positions: Position[];
  history: HistoryEntry[];
  balance: number;
  demoActive: boolean;
  logs: LogEntry[];

  // Actions
  setPrice: (price: number) => void;
  addPosition: (position: Position) => void;
  updatePositionPnl: () => void;
  startDemo: () => void;
  stopDemo: () => void;
  autoHedge: () => void;
  closePosition: (id: string) => void;
  addLog: (log: LogEntry) => void;
  setBalance: (balance: number) => void;
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
}

export const usePerpStore = create<PerpState>((set, get) => ({
  price: 100, // Initial mock price
  fundingRate: 0.01,
  predictedFundingRate: 0.008,
  positions: [],
  history: [],
  balance: 10000,
  demoActive: false,
  logs: [],
  selectedPair: "MEXC:QUBICUSDT",
  setSelectedPair: (pair) => set({ selectedPair: pair }),

  setPrice: (price) => {
    set({ price });
    get().updatePositionPnl();
  },

  setBalance: (balance: number) => set({ balance }),

  addPosition: (position) => set((state) => ({ positions: [...state.positions, position] })),

  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),

  closePosition: (id: string) => {
    const { positions, price, balance } = get();
    const position = positions.find((p) => p.id === id);

    if (position) {
      // Calculate final PnL
      const positionSize = position.size * position.leverage;
      const diff = price - position.entryPrice;
      const finalPnl = position.side === "LONG" ? diff * positionSize : -diff * positionSize;

      // Create History Entry
      const historyEntry: HistoryEntry = {
        ...position,
        exitPrice: price,
        pnl: finalPnl,
        timestamp: Date.now(),
      };

      // Update State: Remove position, Add history, Update Balance
      // Note: Balance update logic depends on whether PnL is realized in QUBIC or USDT.
      // For this hackathon/testnet, let's assume PnL is settled in the collateral token (QUBIC).
      // Original collateral (position.size) is returned + PnL.

      // Actually, let's keep it simple: Balance += Collateral + (PnL / Price)
      // If PnL is in Quote currency (USDT), we divide by price to get QUBIC.

      // Let's assume PnL is in Quote Currency (USDT value) for display
      // But settlement is in QUBIC.
      // New Balance = Old Balance + Collateral + (PnL_USDT / Price_USDT)

      const pnlInQubic = finalPnl / price;
      const newBalance = balance + position.size + pnlInQubic;

      set((state) => ({
        positions: state.positions.filter((p) => p.id !== id),
        history: [historyEntry, ...state.history],
        balance: newBalance,
      }));
    }
  },

  updatePositionPnl: () => {
    const { price, positions, demoActive, autoHedge } = get();
    const updatedPositions = positions.map((pos) => {
      // PnL Calculation
      // Size in store is currently Collateral Amount (e.g. 100 QUBIC)
      // Position Value = Collateral * Leverage * Price
      // Long PnL = (CurrentPrice - EntryPrice) * (Collateral * Leverage)
      // Short PnL = (EntryPrice - CurrentPrice) * (Collateral * Leverage)

      const positionSize = pos.size * pos.leverage;
      const diff = price - pos.entryPrice;
      const pnl = pos.side === "LONG" ? diff * positionSize : -diff * positionSize;

      return { ...pos, pnl };
    });
    set({ positions: updatedPositions });

    // Demo Logic: Check for Auto-Hedge trigger
    if (demoActive) {
      const longPos = positions.find((p) => p.side === "LONG" && p.id === "demo-long");
      if (longPos && price < 98 && !positions.find((p) => p.side === "SHORT")) {
        autoHedge();
      }
    }
  },

  startDemo: () => {
    set({ demoActive: true, positions: [], logs: [] });
    const { createToast } = useToast.getState();

    createToast(ToastIds.ALERT, {
      title: "Demo Scenario Started",
      message: "Opened 5x Long. Simulating price dip...",
      type: "info",
    });

    // Simulate Price Path
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      const currentPrice = get().price;
      let newPrice = currentPrice;

      if (tick < 10) {
        // Stable
        newPrice = 100 + (Math.random() - 0.5) * 0.2;
      } else if (tick >= 10 && tick < 25) {
        // Dip
        newPrice = currentPrice - 0.2 - Math.random() * 0.1;
      } else {
        // Recover slightly
        newPrice = currentPrice + Math.random() * 0.1;
      }

      get().setPrice(newPrice);

      if (tick > 50) {
        clearInterval(interval);
        set({ demoActive: false });
        createToast(ToastIds.ALERT, {
          title: "Demo Scenario Completed",
          message: "Simulation finished.",
          type: "success",
        });
      }
    }, 200);
  },

  stopDemo: () => set({ demoActive: false }),

  autoHedge: () => {
    const { price, positions, addLog } = get();
    const { createToast } = useToast.getState();
    const longPos = positions.find((p) => p.side === "LONG");

    if (longPos) {
      const hedgeSize = longPos.size; // Full hedge
      const hedgePos: Position = {
        id: "hedge-1",
        symbol: "QUBIC-PERP",
        side: "SHORT",
        size: hedgeSize,
        leverage: 1,
        entryPrice: price,
        pnl: 0,
      };

      set((state) => ({ positions: [...state.positions, hedgePos] }));

      const log: LogEntry = {
        time: new Date().toLocaleTimeString(),
        type: "action",
        title: "AI Auto-Hedge Triggered",
        detail: `Price dropped below threshold. Opened ${hedgeSize} QUBIC Short Hedge.`,
      };
      addLog(log);

      createToast(ToastIds.ALERT, {
        title: "AI Auto-Hedge Triggered",
        message: "Protecting position from further downside.",
        type: "warning",
      });
    }
  },
}));
