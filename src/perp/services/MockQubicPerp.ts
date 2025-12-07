// import { publicKeyStringToBytes } from "@qubic-lib/qubic-ts-library/dist/converter/converter";

// Constants matching QubicPerp.h
const ORDER_SIZE = 64;

interface Order {
  owner: string; // Hex string of public key
  orderId: bigint;
  price: bigint;
  size: bigint;
  type: number; // 0 = Long, 1 = Short
  tick: number;
}

export class MockQubicPerp {
  private orders: Order[] = [];
  private nextOrderId: bigint = BigInt(1);

  constructor() {
    // Initialize with some dummy data
    this.addOrder("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", BigInt(100), BigInt(1000), 1, 0); // Short
    this.addOrder("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", BigInt(99), BigInt(1500), 0, 0); // Long
  }

  private addOrder(owner: string, price: bigint, size: bigint, type: number, tick: number) {
    this.orders.push({
      owner,
      orderId: this.nextOrderId++,
      price,
      size,
      type,
      tick,
    });
  }

  // Procedure: Place Order
  // Input: price(8), size(8), type(1), collateral(1), tp(8), sl(8)
  placeOrder(senderPublicKey: string, payload: Uint8Array, tick: number) {
    const view = new DataView(payload.buffer);
    let offset = 0;

    const price = view.getBigUint64(offset, true);
    offset += 8;
    const size = view.getBigUint64(offset, true);
    offset += 8;
    const type = view.getUint8(offset);
    offset += 1;
    const collateral = view.getUint8(offset);
    offset += 1;
    const tp = view.getBigUint64(offset, true);
    offset += 8;
    const sl = view.getBigUint64(offset, true);
    offset += 8;

    this.addOrder(senderPublicKey, price, size, type, tick);
    console.log(
      `[MockContract] Order Placed: ID ${this.nextOrderId} | Price ${price} | Size ${size} | ${type === 0 ? "LONG" : "SHORT"} | Collateral ${collateral} | TP ${tp} | SL ${sl}`,
    );
  }

  // Function: Get Order Book
  // Output: Binary stream of orders
  getOrderBook(): string {
    // Struct: Order orders[100]; uint64 count;
    const MAX_ORDERS = 100;
    const bufferSize = MAX_ORDERS * ORDER_SIZE + 8;
    const buffer = new Uint8Array(bufferSize);
    const view = new DataView(buffer.buffer);

    const count = Math.min(this.orders.length, MAX_ORDERS);

    for (let i = 0; i < count; i++) {
      const order = this.orders[i];
      const offset = i * ORDER_SIZE;

      // Owner (32 bytes)
      // For simplicity in mock, we just fill with 0s or parse if we really want
      // const ownerBytes = publicKeyStringToBytes(order.owner);
      // buffer.set(ownerBytes.slice(0, 32), offset);

      // Order ID (8 bytes) at offset + 32
      view.setBigUint64(offset + 32, order.orderId, true);

      // Price (8 bytes) at offset + 40
      view.setBigUint64(offset + 40, order.price, true);

      // Size (8 bytes) at offset + 48
      view.setBigUint64(offset + 48, order.size, true);

      // Type (1 byte) at offset + 56
      view.setUint8(offset + 56, order.type);

      // Tick (4 bytes) at offset + 57
      view.setUint32(offset + 57, order.tick, true);
    }

    // Count (8 bytes) at the end
    view.setBigUint64(MAX_ORDERS * ORDER_SIZE, BigInt(count), true);

    // Convert to Base64 string
    let binary = "";
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }
}

export const mockQubicPerp = new MockQubicPerp();
