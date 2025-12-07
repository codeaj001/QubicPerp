import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftLine } from "react-icons/ri";
import styles from "./ComingSoonPage.module.scss";

interface ComingSoonPageProps {
  readonly title: string;
  readonly description?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.badge}>COMING SOON</div>
        <p className={styles.description}>
          {description || "We are working hard to bring you this feature. Stay tuned for updates!"}
        </p>

        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <RiArrowLeftLine />
          <span>Go Back</span>
        </button>
      </motion.div>
    </div>
  );
};
