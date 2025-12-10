import { create } from "zustand";
import { useQubicConnect } from "../qubic/QubicConnectContext";

interface Store {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  balance: number;
  setBalance: (balance: number) => void;
}

const store = create<Store>((set) => ({
  isLoading: true,
  setLoading: (isLoading: boolean) => set({ isLoading }),
  balance: 0,
  setBalance: (balance: number) => set({ balance }),
}));

export const useBalance = () => {
  const { wallet, getBalance } = useQubicConnect();
  const { isLoading, setLoading, balance, setBalance } = store();

  const refetch = async () => {
    if (!wallet?.publicKey) {
      return;
    }

    setLoading(true);
    try {
      const balanceData = await getBalance(wallet.publicKey);
      const balanceAmount = balanceData.balance || 0;
      setBalance(balanceAmount);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    refetch,
    data: {
      balance,
    },
  };
};
