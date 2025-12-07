import { PerpLayout } from "../components/PerpLayout";
import { TradingChart } from "../components/TradingChart";
import { OrderForm } from "../components/OrderForm";
import { Positions } from "../components/Positions";
import { PerpHeader } from "../components/PerpHeader";
import { OrderBook } from "../components/OrderBook";

export function PerpPage() {
  return (
    <PerpLayout
      header={<PerpHeader />}
      orderBook={<OrderBook />}
      chart={<TradingChart />}
      orderForm={<OrderForm />}
      positions={<Positions />}
    />
  );
}
