import { useNavigate } from "react-router-dom";
import { RiArrowLeftLine } from "react-icons/ri";
// import { WalletAccount } from "@/wallet/components/WalletAccount";
import { usePerpStore } from "../store/perpStore";
import styles from "./PerpHeader.module.scss";

export function PerpHeader() {
  const navigate = useNavigate();
  const price = usePerpStore((state) => state.price);
  const fundingRate = usePerpStore((state) => state.fundingRate);
  const predictedFundingRate = usePerpStore((state) => state.predictedFundingRate);

  const selectedPair = usePerpStore((state) => state.selectedPair);
  const setSelectedPair = usePerpStore((state) => state.setSelectedPair);

  return (
    <div className={styles.container}>
      <div className={styles.backNav} onClick={() => navigate(-1)} title="Go Back">
        <RiArrowLeftLine className={styles.icon} />
        <span className={styles.brand}>QubicPerp</span>
      </div>

      <div className={styles.pairSelector}>
        <select value={selectedPair} onChange={(e) => setSelectedPair(e.target.value)} className={styles.select}>
          <option value="MEXC:QUBICUSDT">QUBIC/USDT (MEXC)</option>
          <option value="GATEIO:QUBICUSDT">QUBIC/USDT (Gate.io)</option>
          <option value="BITGET:QUBICUSDT">QUBIC/USDT (Bitget)</option>
        </select>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.label}>Price</span>
          <span className={styles.value}>{price.toFixed(4)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>24h Change</span>
          <span className={styles.value} style={{ color: "#00e676" }}>
            +5.24%
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Funding / 1h</span>
          <span className={styles.value} style={{ color: "#ffab40" }}>
            {(fundingRate * 100).toFixed(4)}%
          </span>
        </div>
        <div className={`${styles.metric} ${styles.aiMetric}`}>
          <span className={styles.label}>AI Predicted Rate</span>
          <span className={styles.value}>{(predictedFundingRate * 100).toFixed(4)}%</span>
        </div>
      </div>

      {/* WalletAccount is now in the global AppBar */}
    </div>
  );
}
