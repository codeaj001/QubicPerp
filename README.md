# QubicPerp - The Ultimate DeFi Super App on Qubic

![QubicPerp Cover](public/cover-image.png)

**QubicPerp** is a comprehensive DeFi Super App built on the high-performance **Qubic Network**. It unifies the fragmented decentralized finance landscape into a single, seamless interface, leveraging Qubic's unique capabilities like 15M+ TPS and zero gas fees.

## 🚀 Features

### 1. **Instant Swaps**
-   **Zero Gas Fees**: Trade without worrying about network costs.
-   **Deep Liquidity**: Seamlessly swap between QUBIC, USDT, CFB, and other ecosystem tokens.
-   **Instant Finality**: Leveraging Qubic's speed for immediate trade execution.

### 2. **Perpetual Futures (AI-Powered)**
-   **Leverage Trading**: Trade with up to 50x leverage on major crypto pairs.
-   **AI Insights**: Real-time funding rate predictions and market sentiment analysis powered by **Google Gemini AI**.
-   **On-Chain Orderbook**: Transparent and fair execution.

### 3. **AI Prediction Markets**
-   **Real-World Events**: Bet on outcomes in Crypto, Sports, Politics, and Tech.
-   **AI Oracle**: Markets are generated and automatically resolved by an AI Oracle (Gemini), ensuring impartiality and speed.
-   **Future-Proof**: Predictions focus on 2026 events, providing long-term engagement.

### 4. **Lending & Staking (Coming Soon)**
-   **Earn Yield**: Stake your QUBIC to earn passive rewards.
-   **Borrow**: Use your assets as collateral to borrow stablecoins.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite, SCSS
-   **Smart Contract**: Custom C++ (HM25 Template) on Qubic Testnet
-   **AI Integration**: Google Gemini API (via Vercel AI SDK / Direct API)
-   **Wallet**: Qubic Connect (Snap / Vault)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/codeaj001/QubicPerp.git
    cd QubicPerp
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API=your_google_gemini_api_key
    VITE_HTTP_ENDPOINT=http://91.210.226.146  # Qubic Testnet Node
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## 🔗 Links

-   **Demo**: [https://qubic-perp-demo.vercel.app](https://qubic-perp-demo.vercel.app)
-   **Repo**: [https://github.com/codeaj001/QubicPerp](https://github.com/codeaj001/QubicPerp)

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
