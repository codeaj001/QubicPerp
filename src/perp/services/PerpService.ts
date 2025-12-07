// Placeholder DEX Contract Address (e.g., the QubicPerp smart contract ID)
// Placeholder DEX Contract Address (using the QX contract ID from docs as a placeholder)
export const DEX_CONTRACT_ADDRESS = "BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARMID";

export interface OrderParams {
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  price: number;
  leverage: number;
  type: "LIMIT" | "MARKET";
  collateralToken: string;
  takeProfit?: number;
  stopLoss?: number;
}

import { publicKeyStringToBytes } from "@qubic-lib/qubic-ts-library/dist/converter/converter";

export class PerpService {
  constructor() {}

  buildTransaction(data: {
    sourcePublicKey: string;
    destinationPublicKey: string;
    amount: number;
    tick: number;
    inputType: number;
    payload: Uint8Array;
  }): Uint8Array {
    const TRANSACTION_SIZE = 1024;
    const PUBLIC_KEY_LENGTH = 32;

    const tx = new Uint8Array(TRANSACTION_SIZE).fill(0);
    const view = new DataView(tx.buffer);
    let offset = 0;

    // Helper to handle potentially missing or invalid keys
    const getBytes = (key: string) => {
      try {
        return publicKeyStringToBytes(key);
      } catch (e) {
        console.error("Invalid public key:", key);
        return new Uint8Array(32);
      }
    };

    const sourceBytes = getBytes(data.sourcePublicKey);
    const destBytes = getBytes(data.destinationPublicKey);

    // Source Public Key
    tx.set(sourceBytes.slice(0, PUBLIC_KEY_LENGTH), offset);
    offset += PUBLIC_KEY_LENGTH;

    // Destination Public Key
    tx.set(destBytes.slice(0, PUBLIC_KEY_LENGTH), offset);
    offset += PUBLIC_KEY_LENGTH;

    // Amount (int64)
    view.setBigInt64(offset, BigInt(data.amount), true);
    offset += 8;

    // Tick (uint32)
    view.setUint32(offset, data.tick, true);
    offset += 4;

    // Input Type (uint16)
    view.setUint16(offset, data.inputType, true);
    offset += 2;

    // Input Size (uint16)
    view.setUint16(offset, data.payload.length, true);
    offset += 2;

    // Payload
    tx.set(data.payload, offset);

    return tx;
  }

  /**
   * Encodes the order parameters into a binary payload for the smart contract.
   * This is a mock implementation mimicking how Qubic smart contract payloads are structured.
   */
  encodeOrderPayload(params: OrderParams): Uint8Array {
    // Matches PlaceOrder_input struct in QubicPerp.h (Updated):
    // struct PlaceOrder_input {
    //     uint64 price;
    //     uint64 size;
    //     uint8 type; // 0 = Long, 1 = Short
    //     uint8 collateralType; // 1=QUBIC, 2=CFB, 3=USDT
    //     uint64 takeProfit;
    //     uint64 stopLoss;
    // };

    const buffer = new ArrayBuffer(34); // 8 + 8 + 1 + 1 + 8 + 8
    const view = new DataView(buffer);

    let offset = 0;

    // Price (uint64)
    view.setBigUint64(offset, BigInt(Math.floor(params.price)), true);
    offset += 8;

    // Size (uint64)
    view.setBigUint64(offset, BigInt(Math.floor(params.size)), true);
    offset += 8;

    // Type (uint8): 0 = Long, 1 = Short
    view.setUint8(offset, params.side === "LONG" ? 0 : 1);
    offset += 1;

    // Collateral Type (uint8)
    let collateralId = 1; // Default QUBIC
    if (params.collateralToken === "CFB") collateralId = 2;
    if (params.collateralToken === "USDT") collateralId = 3;
    view.setUint8(offset, collateralId);
    offset += 1;

    // Take Profit (uint64)
    const tp = params.takeProfit ? Math.floor(params.takeProfit) : 0;
    view.setBigUint64(offset, BigInt(tp), true);
    offset += 8;

    // Stop Loss (uint64)
    const sl = params.stopLoss ? Math.floor(params.stopLoss) : 0;
    view.setBigUint64(offset, BigInt(sl), true);
    offset += 8;

    return new Uint8Array(buffer);
  }

  /**
   * Prepares the transaction object for signing.
   */
  async prepareOrderTransaction(senderPublicKey: string, params: OrderParams, tick: number) {
    const payload = this.encodeOrderPayload(params);

    // In Qubic, calling a contract usually involves sending 0 amount with a payload
    // The destination is the contract address
    return {
      sourcePublicKey: senderPublicKey,
      destinationPublicKey: DEX_CONTRACT_ADDRESS,
      amount: 0,
      tick: tick + 10, // Future tick
      inputType: 1, // Function call
      payload: payload,
    };
  }

  /**
   * Decodes the binary response from the GetOrderBook smart contract function.
   * Matches the GetOrderBook_output struct in QubicPerp.h.
   */
  decodeOrderBookResponse(base64Data: string): any[] {
    // Decode Base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const view = new DataView(bytes.buffer);
    // let offset = 0; // Not used as we calculate offsets manually

    // Struct definition:
    // struct GetOrderBook_output {
    //     Order orders[100];
    //     uint64 count;
    // };
    // Order struct:
    // struct Order {
    //     id owner; (32 bytes)
    //     uint64 orderId; (8 bytes)
    //     uint64 price; (8 bytes)
    //     uint64 size; (8 bytes)
    //     uint8 type; (1 byte)
    //     uint32 tick; (4 bytes)
    // };
    // Total Order size = 32 + 8 + 8 + 8 + 1 + 4 = 61 bytes (plus padding/alignment? C++ structs are usually aligned)
    // Assuming packed or standard alignment. Let's assume standard alignment might add padding.
    // For now, we'll assume packed or manual offset calculation.
    // 32 (owner) + 8 (id) + 8 (price) + 8 (size) + 1 (type) + 4 (tick) = 61 bytes.
    // Alignment to 8 bytes might make it 64 bytes. Let's try 64 bytes per order.

    const ORDER_SIZE = 64; // Safe assumption for C++ struct alignment
    const MAX_ORDERS_RETURNED = 100;

    const orders = [];

    // We need to find where 'count' is. It's at the end of the array.
    // offset of count = 100 * ORDER_SIZE
    const countOffset = MAX_ORDERS_RETURNED * ORDER_SIZE;

    if (bytes.byteLength < countOffset + 8) {
      console.warn("Response data too short to contain order book");
      return [];
    }

    const count = Number(view.getBigUint64(countOffset, true));

    for (let i = 0; i < count; i++) {
      const orderOffset = i * ORDER_SIZE;

      // Skip owner (32 bytes)

      const orderId = view.getBigUint64(orderOffset + 32, true);
      const price = view.getBigUint64(orderOffset + 40, true);
      const size = view.getBigUint64(orderOffset + 48, true);
      const type = view.getUint8(orderOffset + 56);
      // tick at 57 (4 bytes)

      orders.push({
        id: orderId.toString(),
        price: Number(price), // Scale down if needed
        size: Number(size),
        side: type === 0 ? "LONG" : "SHORT",
        type: "LIMIT",
      });
    }

    return orders;
  }
}

export const perpService = new PerpService();
