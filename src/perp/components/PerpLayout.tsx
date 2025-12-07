import { ReactNode } from "react";
import styles from "./PerpLayout.module.scss";

interface PerpLayoutProps {
  readonly header: ReactNode;
  readonly orderBook: ReactNode;
  readonly chart: ReactNode;
  readonly orderForm: ReactNode;
  readonly positions: ReactNode;
}

export function PerpLayout({ header, orderBook, chart, orderForm, positions }: PerpLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.header}>{header}</div>
      <div className={styles.orderBook}>{orderBook}</div>
      <div className={styles.chart}>{chart}</div>
      <div className={styles.orderForm}>{orderForm}</div>
      <div className={styles.positions}>{positions}</div>
    </div>
  );
}
