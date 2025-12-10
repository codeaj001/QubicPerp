# Implementation Plan - QubicPerp (Overhaul)

## Goal
Rebuild QubicPerp with a modern, professional DEX interface, integrating TradingView charts, and emphasizing the "AI-leveraged" product identity.

## Steps

1.  **Dependencies**
    - Install `react-ts-tradingview-widgets` (or use script tag if preferred, but package is cleaner).

2.  **Design System & Layout**
    - Update `src/perp/components/PerpLayout.module.scss` to use a professional grid layout (Header, Left Sidebar/OrderBook, Center Chart, Right OrderForm, Bottom Positions).
    - Use a sleek dark color palette (Background: `#0b0e11`, Surface: `#151a21`, Accents: `#00e676` (Long), `#ff4d4d` (Short), `#8bf827` (AI/Qubic Green)).

3.  **Components Overhaul**
    - **Header (`PerpHeader.tsx`)**:
        - Modernize look.
        - Include `WalletAccount` for connection.
        - Display key metrics (Price, 24h Change, **AI Predicted Funding Rate**).
    - **Chart (`TradingChart.tsx`)**:
        - Replace canvas with TradingView widget (`AdvancedRealTimeChart` or similar).
        - Configure for "QUBIC" or a similar proxy symbol if QUBIC isn't available (or just BTCUSD for demo purposes with a note).
    - **Order Form (`OrderForm.tsx`)**:
        - "Pro" trading interface.
        - Tabs: Limit, Market, **AI-Algo** (new tab for the "AI-leveraged" feature).
        - Leverage slider with visual feedback.
        - "Start Demo Scenario" button (keep functionality but style it better).
    - **Order Book (`OrderBook.tsx`)**:
        - Create a mock order book component to fill the UI and make it look like a real DEX.
    - **Positions (`Positions.tsx`)**:
        - Tabbed view: Positions, Open Orders, Order History, **AI Hedge Log**.

4.  **AI Features Integration**
    - Visual indicators for AI predictions.
    - "AI Confidence" meter in the Order Form.
    - "Auto-Hedge" toggle with explanation.

5.  **State Management**
    - Keep `perpStore.ts` but extend it if necessary for new UI states (e.g., selected tab, AI mode).

6.  **Refinement**
    - Ensure mobile responsiveness (stack layout on mobile).
    - Add tooltips/info icons explaining the AI features.

## Verification
- Build and run.
- Check TradingView widget loads.
- Verify Wallet connection works in the new header.
- Run the Demo Scenario and ensure it still works (updating the store/state).
