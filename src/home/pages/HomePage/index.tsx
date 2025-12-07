import React from "react";
import { Link } from "react-router-dom";
import { RiRocketLine, RiCpuLine, RiSpeedUpLine, RiExchangeDollarLine } from "react-icons/ri";
import { useAppTitle } from "@/shared/hooks/useAppTitle";
import styles from "./HomePage.module.scss";
import heroBg from "../../assets/images/hero-bg.png";

export const HomePage: React.FC = () => {
  useAppTitle("QubicPerp | AI-Leveraged Trading");

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.layout}>
      {/* Hero Section */}
      <section className={styles.hero} style={{ backgroundImage: `url(${heroBg})` }}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            The Ultimate <br />
            <span>DeFi Super App</span>
          </h1>
          <p className={styles.subtitle}>
            Experience the next generation of DeFi on Qubic.
            <br />
            Swap, Trade, Lend, Predict & Stake. All in one place.
          </p>
          <div className={styles.actions}>
            <Link to="/swap" className={styles.primaryBtn}>
              <RiRocketLine /> Start Swapping
            </Link>
            <button onClick={scrollToFeatures} className={styles.secondaryBtn}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.icon}>
            <RiCpuLine />
          </div>
          <h3>AI-Powered Insights</h3>
          <p>
            Gain a competitive edge with real-time funding rate predictions and automated hedging strategies powered by
            on-chain machine learning.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.icon}>
            <RiSpeedUpLine />
          </div>
          <h3>Instant Execution</h3>
          <p>
            Built on Qubic's high-performance core, executing trades at lightning speed with up to 15 million
            transactions per second.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.icon}>
            <RiExchangeDollarLine />
          </div>
          <h3>Deep Liquidity</h3>
          <p>
            Trade with confidence using our advanced order matching engine and deep liquidity pools designed for
            institutional-grade volume.
          </p>
        </div>
      </section>
    </div>
  );
};
