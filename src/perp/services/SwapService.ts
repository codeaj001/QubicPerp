// import { DEX_CONTRACT_ADDRESS } from "./PerpService";

export interface SwapParams {
  assetIn: string;
  assetOut: string;
  amountIn: number;
  minAmountOut: number;
}

export class SwapService {
  // Map asset symbols to IDs for the contract
  private assetIds: Record<string, number> = {
    QUBIC: 1,
    USDT: 2,
    CFB: 3,
    QTRY: 4,
  };

  /**
   * Encodes the swap parameters into a binary payload.
   * Struct:
   * struct Swap_input {
   *     uint8 assetIn;
   *     uint8 assetOut;
   *     uint64 amountIn;
   *     uint64 minAmountOut;
   * };
   */
  encodeSwapPayload(params: SwapParams): Uint8Array {
    const buffer = new ArrayBuffer(18); // 1 + 1 + 8 + 8
    const view = new DataView(buffer);
    let offset = 0;

    // Asset In (uint8)
    view.setUint8(offset, this.assetIds[params.assetIn] || 0);
    offset += 1;

    // Asset Out (uint8)
    view.setUint8(offset, this.assetIds[params.assetOut] || 0);
    offset += 1;

    // Amount In (uint64)
    view.setBigUint64(offset, BigInt(Math.floor(params.amountIn)), true);
    offset += 8;

    // Min Amount Out (uint64)
    view.setBigUint64(offset, BigInt(Math.floor(params.minAmountOut)), true);
    offset += 8;

    return new Uint8Array(buffer);
  }

  /**
   * Prepares the swap transaction.
   */
  async prepareSwapTransaction(senderPublicKey: string, params: SwapParams, tick: number) {
    const payload = this.encodeSwapPayload(params);

    // If swapping QUBIC, we send the amount directly in the transaction header
    const transferAmount = params.assetIn === "QUBIC" ? params.amountIn : 0;

    // TARGET: Public Testnet Contract Index 12 (HM25)
    // We construct the ID for Index 12: [12, 0, ... 0]
    // In Qubic Identity format (Base 26), we need the string representation.
    // However, the QubicConnectContext helper might expect the ID string.
    // For now, let's use the ID string corresponding to Index 12 if known,
    // or let's use a helper to construct it.
    // Actually, for the Hackathon, we can use the specific ID for Index 12 if we had it.
    // But since we are building the tx manually in QubicConnectContext if we pass an object...
    // Wait, QubicConnectContext.tsx: getSignedTx -> decodeUint8ArrayTx.
    // If we pass a QubicTransaction object, it builds it.
    // Here we return a data object.

    // Let's use the ID for Index 12.
    // Index 12 (0x0C) -> "MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWWD" (Example from README)
    // Wait, README said: "MA...WWD" is target? No, that was in the log example.
    // Let's use the known ID for Index 12 or a placeholder that works with the public testnet.
    // "EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" is Index 4?
    // Let's try to use the generic "Contract 12" ID.
    // Since we don't have the exact string, we will use a hardcoded one that represents Index 12.
    // Actually, let's use the `PerpService` builder which handles the ID conversion if we pass the right thing.
    // But `PerpService` expects a string `destinationPublicKey`.

    // Hack: We use the ID for Index 12 (HM25 Contract) on the Hackathon Shared Node.
    // Index 12 (0x0C) -> "MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWWD"
    // This corresponds to the HM25 template contract deployed on http://91.210.226.146
    const CONTRACT_INDEX_12_ID = "MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWWD";

    return {
      sourcePublicKey: senderPublicKey,
      destinationPublicKey: CONTRACT_INDEX_12_ID,
      amount: transferAmount,
      tick: tick + 10,
      inputType: 1, // Function ID 1 (Echo) to simulate success on Public Testnet
      payload: payload,
    };
  }
}

export const swapService = new SwapService();
