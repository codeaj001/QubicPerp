import { useCallback, useEffect, useRef, useState } from "react";

import { RiCloseLine } from "react-icons/ri";
import { SiWalletconnect } from "react-icons/si";

import { useModal } from "@/core/modals/hooks/useModal";
import { useToast } from "@/core/toasts/hooks/useToast";
import { ToastIds } from "@/core/toasts/toasts.types";

import { generateQRCode } from "@/lib/qubic";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";
import { useQubicConnect } from "@/wallet/qubic/QubicConnectContext";
import { connectSnap, getSnap } from "@/wallet/qubic/utils";

import { Selector } from "@/shared/components/Selector";
import { shortHex } from "@/wallet/wallet.helpers";
import { WalletConnectAccount, type Wallet } from "@/wallet/wallet.types";
import { LuWallet } from "react-icons/lu";
import { Card } from "../../../shared/components/Card";
import QubicLogo from "../../assets/images/logo.svg";
import MetamaskLogo from "../../assets/images/metamask.svg";
import styles from "./ConnectModal.module.scss";

/**
 * ConnectModal component that displays wallet connection options.
 *
 * @returns {JSX.Element} The rendered ConnectModal component.
 */
export const ConnectModal = () => {
  const [selectedMode, setSelectedMode] = useState<"none" | "metamask" | "walletconnect">("none");
  const [qrCode, setQrCode] = useState<string>("");
  const walletConnectTimer = useRef<NodeJS.Timeout | null>(null);
  const {
    config,
    connect,
    getMetaMaskPublicId,
    walletConnectConnect,
    walletConnectRequestAccounts,
    disconnect,
    walletConnectIsInitializing,
  } = useQubicConnect();

  const { closeModal } = useModal();
  const [accounts, setAccounts] = useState<WalletConnectAccount[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletConnectAccount | null>(null);

  // Poll for WalletConnect accounts after connection is established
  useEffect(() => {
    if (selectedMode !== "walletconnect") {
      return;
    }

    const checkConnection = async () => {
      try {
        const accounts = await walletConnectRequestAccounts();

        if (accounts?.length > 0) {
          setAccounts(accounts);
          setSelectedWallet(accounts[0]);
          if (walletConnectTimer.current) {
            clearInterval(walletConnectTimer.current);
            walletConnectTimer.current = null;
          }
        }
      } catch (error) {
        // Connection not ready yet, will retry on next interval
      }
    };

    walletConnectTimer.current = setInterval(checkConnection, 1000);

    return () => {
      if (walletConnectTimer.current) {
        clearInterval(walletConnectTimer.current);
        walletConnectTimer.current = null;
      }
    };
  }, [selectedMode, walletConnectRequestAccounts]);

  const { createToast } = useToast();

  /**
   * Handles the click event for connecting to Metamask.
   */
  const handleClickConnect = useCallback(async () => {
    try {
      if (!window.ethereum?.isMetaMask) {
        createToast(ToastIds.ALERT, {
          title: "MetaMask Not Detected",
          message: "It seems you are not using MetaMask. Please install MetaMask to use this feature.",
          type: "error",
        });
        return;
      }

      const snapId = config?.snapOrigin;
      console.log("Attempting to connect to Snap:", snapId);

      try {
        await connectSnap(snapId);
      } catch (err) {
        console.error("connectSnap failed:", err);
        throw new Error(`Failed to connect to Snap: ${err instanceof Error ? err.message : String(err)}`);
      }

      let installedSnap;
      try {
        installedSnap = await getSnap();
        console.log("Installed Snap:", installedSnap);
      } catch (err) {
        console.error("getSnap failed:", err);
        throw new Error("Failed to retrieve installed Snap information.");
      }

      if (!installedSnap) {
        throw new Error("Qubic Snap was not detected after connection. Please try again.");
      }

      // get publicId from snap
      let publicKey;
      try {
        publicKey = await getMetaMaskPublicId(0);
        console.log("Got Public Key:", publicKey);
      } catch (err) {
        console.error("getMetaMaskPublicId failed:", err);
        throw new Error("Failed to retrieve public key from Snap. Please ensure you have approved the permissions.");
      }

      const wallet: Wallet = {
        connectType: "mmSnap",
        publicKey,
      };
      connect(wallet);
      closeModal();
      createToast(ToastIds.ALERT, {
        title: "Wallet Connected",
        message: "Successfully connected with MetaMask.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      createToast(ToastIds.ALERT, {
        title: "Connection Failed",
        message: error instanceof Error ? error.message : "Failed to connect to MetaMask.",
        type: "error",
      });
    }
  }, [config, connect, getMetaMaskPublicId, closeModal, createToast]);

  // Generate WalletConnect URI and QR code (following qearn pattern exactly)
  const generateURI = async () => {
    try {
      console.log("🔗 Starting WalletConnect URI generation...");

      const { uri, approve } = await walletConnectConnect();
      console.log("🔗 URI received:", uri);

      if (!uri) {
        throw new Error("Failed to generate WalletConnect URI. Please try again.");
      }

      console.log("🔗 Generating QR code for URI...");
      const qrCodeDataURL = await generateQRCode(uri);
      console.log("🔗 QR code generated:", qrCodeDataURL ? "success" : "failed");
      setQrCode(qrCodeDataURL);

      // Just wait for approval, don't try to get accounts immediately (like qearn)
      console.log("⏳ Waiting for wallet approval...");
      await approve();
      console.log("✅ WalletConnect approved! Connection established.");

      createToast(ToastIds.ALERT, {
        title: "Wallet Connected",
        message: "Successfully connected with WalletConnect.",
        type: "success",
      });

      // Don't get accounts here - let the useEffect handle it
    } catch (error) {
      console.error("❌ WalletConnect connection failed:", error);
      setSelectedMode("none");
      createToast(ToastIds.ALERT, {
        title: "Connection Failed",
        message: error instanceof Error ? error.message : "Failed to connect with WalletConnect.",
        type: "error",
      });
    }
  };

  /**
   * Handles the click event for connecting to WalletConnect.
   * @param publicKey - The public key of the wallet to connect to.
   */
  const handleConnectWalletConnect = () => {
    if (!selectedWallet) return;

    const wallet: Wallet = {
      connectType: "walletconnect",
      publicKey: selectedWallet.address,
    };
    connect(wallet);
    closeModal();
  };

  if (accounts.length > 0) {
    return (
      <Card className={styles.layout}>
        <QubicLogo />

        <div className={styles.body}>
          <Typography variant={"body"} size={"large"}>
            Select your account
          </Typography>
          <Typography variant={"body"} size={"medium"} className={styles.gray}>
            Select the account you want to connect to Nostromo Launchpad.
          </Typography>
        </div>

        <div className={styles.accounts}>
          <Selector
            label={"Account"}
            value={selectedWallet?.address || ""}
            options={accounts.map((account, index) => ({
              label: account.name || `Account ${index + 1}`,
              value: account.address,
            }))}
            onChange={(value) => {
              const address = value.target.value;
              const account = accounts.find((account) => account.address === address);

              if (account) {
                setSelectedWallet(account);
              }
            }}
          />
          {selectedWallet && (
            <div className={styles.accountDetails}>
              <LuWallet size={18} />
              <Typography variant={"body"} size={"medium"} className={styles.gray}>
                {shortHex(selectedWallet.address, 12)}
              </Typography>
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <Button
            caption={"Cancel"}
            variant={"outline"}
            color={"secondary"}
            onClick={() => {
              setSelectedMode("none");
              setAccounts([]);
              setSelectedWallet(null);
              disconnect();
            }}
          />
          <Button caption={"Connect"} variant={"solid"} color={"primary"} onClick={handleConnectWalletConnect} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.layout}>
      <button className={styles.closeButton} onClick={closeModal}>
        <RiCloseLine size={24} />
      </button>
      <QubicLogo />

      {selectedMode === "none" && (
        <>
          <div className={styles.body}>
            <Typography variant={"body"} size={"large"}>
              Connect your wallet
            </Typography>
            <Typography variant={"body"} size={"medium"} className={styles.gray}>
              Use your favorite provider to connect to Nostromo Launchpad.
            </Typography>
          </div>

          <div className={styles.actions}>
            <Button
              caption={"Metamask"}
              className={styles.metamask}
              variant={"solid"}
              color={"warning"}
              iconLeft={<MetamaskLogo />}
              onClick={() => setSelectedMode("metamask")}
            />
            <Button
              caption={walletConnectIsInitializing ? "Initializing..." : "WalletConnect"}
              variant={"solid"}
              color={"secondary"}
              iconLeft={<SiWalletconnect />}
              disabled={walletConnectIsInitializing}
              onClick={() => {
                setSelectedMode("walletconnect");
                generateURI();
              }}
            />
          </div>
        </>
      )}

      {selectedMode === "metamask" && (
        <div className={styles.metamaskMode}>
          <div className={styles.body}>
            <Typography variant={"body"} size={"large"}>
              Connect with MetaMask
            </Typography>
            <Typography variant={"body"} size={"medium"} className={styles.gray}>
              Connect your MetaMask wallet. You need to have MetaMask installed and unlocked.
            </Typography>
          </div>
          <div className={styles.actions}>
            <Button
              caption={"Cancel"}
              variant={"outline"}
              color={"secondary"}
              onClick={() => setSelectedMode("none")}
            />
            <Button
              caption={"Connect MetaMask"}
              variant={"solid"}
              color={"warning"}
              iconLeft={<MetamaskLogo />}
              onClick={handleClickConnect}
            />
          </div>
        </div>
      )}

      {selectedMode === "walletconnect" && (
        <div className={styles.walletConnectMode}>
          <div className={styles.body}>
            <Typography variant={"body"} size={"large"}>
              Connect with WalletConnect
            </Typography>
            <Typography variant={"body"} size={"medium"} className={styles.gray}>
              Scan the QR code with your Qubic wallet app.
            </Typography>
          </div>

          <div className={styles.qrSection}>
            {qrCode ? (
              <img src={qrCode} alt="WalletConnect QR Code" className={styles.qrCode} />
            ) : (
              <div className={styles.qrLoading}>
                <Typography variant={"body"}>Generating QR code...</Typography>
              </div>
            )}
          </div>

          <Button
            caption={"Cancel"}
            color={"secondary"}
            className={styles.cancelButton}
            onClick={() => setSelectedMode("none")}
          />
        </div>
      )}
    </Card>
  );
};
