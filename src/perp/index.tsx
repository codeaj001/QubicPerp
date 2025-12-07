import { RouteObject } from "react-router-dom";

import { registerModule } from "@/core/modules/modules.helpers";

import { MODULE_PERP, PERP_ROUTES } from "./perp.constants";
import { PerpPage } from "./pages/PerpPage";

import { AppLayout } from "@/shared/layouts/AppLayout";
import { ComingSoonPage } from "@/shared/pages/ComingSoonPage";
import { PredictPage } from "./pages/PredictPage";

import { SwapPage } from "./pages/SwapPage";

const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: PERP_ROUTES.ROOT,
        element: <PerpPage />,
      },
      {
        path: PERP_ROUTES.SWAP,
        element: <SwapPage />,
      },
      {
        path: PERP_ROUTES.LEND,
        element: <ComingSoonPage title="Lend" description="Earn yield on your assets or borrow against them." />,
      },
      {
        path: PERP_ROUTES.PREDICT,
        element: <PredictPage />,
      },
      {
        path: PERP_ROUTES.STAKE,
        element: (
          <ComingSoonPage title="Staking" description="Stake QUBIC to earn rewards and participate in governance." />
        ),
      },
    ],
  },
];

registerModule({
  name: MODULE_PERP,
  routes,
});
