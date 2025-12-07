import { RiCheckLine, RiErrorWarningLine, RiInformationLine, RiCloseLine } from "react-icons/ri";
import styles from "./AlertToast.module.scss";
import { AlertToastProps } from "../toasts.types";

export function AlertToast({ title, message, type }: AlertToastProps) {
  const icons = {
    success: <RiCheckLine />,
    error: <RiCloseLine />,
    warning: <RiErrorWarningLine />,
    info: <RiInformationLine />,
  };

  return (
    <div className={`${styles.container} ${styles[type]}`}>
      <div className={styles.icon}>{icons[type]}</div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  );
}
