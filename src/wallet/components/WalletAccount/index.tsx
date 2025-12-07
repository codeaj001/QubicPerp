import { useNavigate } from "react-router-dom";

import { RiAliensFill, RiLogoutBoxLine, RiWallet2Line, RiDropLine } from "react-icons/ri";

import { useModal } from "@/core/modals/hooks/useModal";
import { ModalsIds } from "@/core/modals/modals.types";
import { HOME_ROUTES } from "@/home/home.constants";
import { getRoute } from "@/lib/router";
import { Button } from "@/shared/components/Button";
import { IconButton } from "@/shared/components/IconButton";
import useResponsive from "@/shared/hooks/useResponsive";
import { USER_ROUTES } from "@/user/user.constants";
import { UserSettingsTabs } from "@/user/user.types";
import { useQubicConnect } from "@/wallet/qubic/QubicConnectContext";

import styles from "./WalletAccount.module.scss";
import { shortHex } from "../../wallet.helpers";

/**
 * WalletAccount component that displays the connected wallet address or a button to connect the wallet.
 *
 * @returns {JSX.Element} The WalletAccount component.
 */
import { TESTNET_SEEDS } from "@/wallet/qubic/config/TestnetSeeds";
import { useState } from "react";

export const WalletAccount: React.FC = () => {
  const navigate = useNavigate();
  const { connected, wallet, disconnect, connect, qHelper } = useQubicConnect();
  const { isMobile, isTabletVertical } = useResponsive();
  const { openModal } = useModal();
  const [showSeeds, setShowSeeds] = useState(false);

  const isMobileOrTabletVertical = isMobile || isTabletVertical;

  const handleClickAccount = () => {
    navigate(getRoute(USER_ROUTES.SETTINGS, { tabId: UserSettingsTabs.OVERVIEW }));
  };

  const handleClickConnect = async () => {
    openModal(ModalsIds.CONNECT);
  };

  const handleClickDisconnect = () => {
    disconnect();
    navigate(getRoute(HOME_ROUTES.HOME));
  };

  const handleConnectSeed = async (seed: string) => {
    try {
      // Derive public key from seed (assuming seed is private key for Qubic)
      const idPackage = await qHelper.createIdPackage(seed);
      const publicId = await qHelper.getIdentity(idPackage.publicKey);

      connect({
        connectType: "privateKey",
        publicKey: publicId,
        privateKey: seed,
      });
      setShowSeeds(false);
    } catch (e) {
      console.error("Failed to connect with seed", e);
    }
  };

  return (
    <div className={styles.layout}>
      {connected && wallet ? (
        <div className={styles.actions}>
          {isMobileOrTabletVertical ? (
            <IconButton size={"medium"} variant={"ghost"} icon={<RiAliensFill />} onClick={handleClickAccount} />
          ) : (
            <Button
              size={"medium"}
              variant={"ghost"}
              iconRight={<RiAliensFill />}
              caption={shortHex(wallet.publicKey, 5)}
              onClick={handleClickAccount}
            />
          )}

          <IconButton
            size={"medium"}
            variant={"ghost"}
            icon={<RiDropLine />}
            onClick={() => window.open("https://discord.gg/qubic", "_blank")}
            title="Get Testnet Funds (Discord Faucet)"
          />
          <IconButton size={"medium"} variant={"ghost"} icon={<RiLogoutBoxLine />} onClick={handleClickDisconnect} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Button
              variant={"outline"}
              color={"secondary"}
              size={"medium"}
              caption={"Testnet Whale"}
              onClick={() => setShowSeeds(!showSeeds)}
              style={{ fontSize: "0.8rem", padding: "0 12px" }}
            />
            {showSeeds && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "#1e1e1e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "8px",
                  zIndex: 100,
                  minWidth: "200px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {TESTNET_SEEDS.map((seed, i) => (
                  <button
                    key={i}
                    onClick={() => handleConnectSeed(seed.seed)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      padding: "8px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      borderRadius: "4px",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {seed.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant={"solid"}
            color={"primary"}
            size={"medium"}
            caption={"Connect Wallet"}
            onClick={handleClickConnect}
            iconLeft={<RiWallet2Line />}
          />
        </div>
      )}
    </div>
  );
};
