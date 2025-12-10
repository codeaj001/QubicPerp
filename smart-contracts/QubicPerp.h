#pragma once

#include <cstdint>

// Qubic Types Definitions
typedef uint8_t uint8;
typedef uint16_t uint16;
typedef uint32_t uint32;
typedef uint64_t uint64;
typedef int64_t sint64;
typedef uint8_t id[32]; // Public Key is 32 bytes

// Constants
const uint64 MAX_ORDERS = 1000;
const uint64 MAX_POOLS = 10;
const uint64 MAX_MARKETS = 50;
const uint64 MAX_STAKERS = 1000;

// --- PERPS ---
struct Order {
    id owner;
    uint64 orderId;
    uint64 price;
    uint64 size;
    uint8 type; // 0=Long, 1=Short
    uint32 tick;
};

// --- SWAP ---
struct LiquidityPool {
    uint8 assetA;
    uint8 assetB;
    uint64 reserveA;
    uint64 reserveB;
};

// --- LEND ---
struct LendingPosition {
    id user;
    uint64 suppliedAmount;
    uint64 borrowedAmount;
    uint8 assetId;
};

// --- PREDICT ---
struct PredictionMarket {
    uint64 marketId;
    uint64 endTime;
    uint64 totalYes;
    uint64 totalNo;
    uint8 resolvedOutcome; // 0=Unresolved, 1=Yes, 2=No
};

// --- STAKE ---
struct Staker {
    id user;
    uint64 amount;
    uint64 startTime;
};

// --- STATE ---
struct ContractState {
    // Perps
    Order orders[MAX_ORDERS];
    uint64 orderCount;
    uint64 nextOrderId;

    // Swap
    LiquidityPool pools[MAX_POOLS];
    uint64 poolCount;

    // Lend
    LendingPosition lendingPositions[MAX_STAKERS];
    uint64 lendingCount;

    // Predict
    PredictionMarket markets[MAX_MARKETS];
    uint64 marketCount;
    uint64 nextMarketId;

    // Stake
    Staker stakers[MAX_STAKERS];
    uint64 stakerCount;
};

// --- INPUTS ---

// InputType 1: Place Order
struct PlaceOrder_input {
    uint64 price;
    uint64 size;
    uint8 type;
};

// InputType 2: Cancel Order
struct CancelOrder_input {
    uint64 orderId;
};

// InputType 3: Swap
struct Swap_input {
    uint8 assetIn;
    uint8 assetOut;
    uint64 amountIn;
    uint64 minAmountOut;
};

// InputType 4: Lend (Placeholder)
struct Lend_input {
    uint8 assetId;
    uint64 amount;
    uint8 action;
};

// InputType 5: Predict (Create or Bet)
struct Predict_input {
    uint64 marketId; // If 0, create new market
    uint64 amount;
    uint8 prediction; // 1=Yes, 2=No
    uint64 duration; // Only used when creating market
};

// InputType 6: Stake
struct Stake_input {
    uint64 amount;
    uint8 action;
};

// InputType 7: Resolve Market (AI Oracle)
struct Resolve_input {
    uint64 marketId;
    uint8 outcome; // 1=Yes, 2=No
};

// --- OUTPUTS ---

struct GetState_output {
    uint64 orderCount;
    uint64 poolCount;
    uint64 marketCount;
    uint64 stakerCount;
};
