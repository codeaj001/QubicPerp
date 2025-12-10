#include "QubicPerp.h"
#include <cstring> // For memcpy, memcmp

// Global Contract State
static ContractState state;

// -----------------------------------------------------------------------------
// Procedures (State-Changing Operations)
// -----------------------------------------------------------------------------

// Procedure 1: Place Order
void procedure_PlaceOrder(const PlaceOrder_input* input, const id* caller) {
    if (state.orderCount < MAX_ORDERS) {
        Order& order = state.orders[state.orderCount++];
        std::memcpy(order.owner, caller, 32);
        order.orderId = state.nextOrderId++;
        order.price = input->price;
        order.size = input->size;
        order.type = input->type;
        order.tick = 0; 
    }
}

// Procedure 2: Cancel Order
void procedure_CancelOrder(const CancelOrder_input* input, const id* caller) {
    for (uint64 i = 0; i < state.orderCount; i++) {
        if (state.orders[i].orderId == input->orderId) {
            if (std::memcmp(state.orders[i].owner, caller, 32) == 0) {
                if (i < state.orderCount - 1) {
                    state.orders[i] = state.orders[state.orderCount - 1];
                }
                state.orderCount--;
                return;
            }
        }
    }
}

// Procedure 3: Swap
void procedure_Swap(const Swap_input* input, const id* caller) {
    if (state.poolCount == 0) {
        state.pools[0].assetA = 1;
        state.pools[0].assetB = 2;
        state.pools[0].reserveA = 1000000;
        state.pools[0].reserveB = 1000000;
        state.poolCount = 1;
    }
}

// Procedure 4: Lend
void procedure_Lend(const Lend_input* input, const id* caller) {
    // Mock Lending
}

// Procedure 5: Predict
void procedure_Predict(const Predict_input* input, const id* caller) {
    if (input->marketId == 0) {
        // Create Market
        if (state.marketCount < MAX_MARKETS) {
            PredictionMarket& market = state.markets[state.marketCount++];
            market.marketId = state.nextMarketId++;
            market.endTime = input->duration;
            market.resolvedOutcome = 0;
            market.totalYes = 0;
            market.totalNo = 0;
        }
    } else {
        // Place Bet
        for (uint64 i = 0; i < state.marketCount; i++) {
            if (state.markets[i].marketId == input->marketId) {
                if (state.markets[i].resolvedOutcome == 0) { // Only bet if unresolved
                    if (input->prediction == 1) state.markets[i].totalYes += input->amount;
                    if (input->prediction == 2) state.markets[i].totalNo += input->amount;
                }
                return;
            }
        }
    }
}

// Procedure 6: Stake
void procedure_Stake(const Stake_input* input, const id* caller) {
    for (uint64 i = 0; i < state.stakerCount; i++) {
        if (std::memcmp(state.stakers[i].user, caller, 32) == 0) {
            if (input->action == 0) state.stakers[i].amount += input->amount;
            if (input->action == 1 && state.stakers[i].amount >= input->amount) 
                state.stakers[i].amount -= input->amount;
            return;
        }
    }
    if (state.stakerCount < MAX_STAKERS && input->action == 0) {
        Staker& s = state.stakers[state.stakerCount++];
        std::memcpy(s.user, caller, 32);
        s.amount = input->amount;
        s.startTime = 0;
    }
}

// Procedure 7: Resolve Market (AI Oracle)
void procedure_Resolve(const Resolve_input* input, const id* caller) {
    // In a real scenario, we would check if 'caller' is the authorized Oracle address
    for (uint64 i = 0; i < state.marketCount; i++) {
        if (state.markets[i].marketId == input->marketId) {
            state.markets[i].resolvedOutcome = input->outcome;
            return;
        }
    }
}

// -----------------------------------------------------------------------------
// Contract Entry Points
// -----------------------------------------------------------------------------

extern C void OnLoad() {
    if (state.nextOrderId == 0) state.nextOrderId = 1;
    if (state.nextMarketId == 0) state.nextMarketId = 1;
}

extern C void OnProcedure(uint32 inputType, const void* input, const id* caller) {
    switch (inputType) {
        case 1: procedure_PlaceOrder((const PlaceOrder_input*)input, caller); break;
        case 2: procedure_CancelOrder((const CancelOrder_input*)input, caller); break;
        case 3: procedure_Swap((const Swap_input*)input, caller); break;
        case 4: procedure_Lend((const Lend_input*)input, caller); break;
        case 5: procedure_Predict((const Predict_input*)input, caller); break;
        case 6: procedure_Stake((const Stake_input*)input, caller); break;
        case 7: procedure_Resolve((const Resolve_input*)input, caller); break;
    }
}

extern C void OnFunction(uint32 functionIndex, void* output) {
    if (functionIndex == 1) {
        function_GetState((GetState_output*)output);
    }
}
