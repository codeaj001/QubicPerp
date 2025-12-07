import { z } from "zod";

import { TierSchema } from "./tier.schema";

/**
 * Enum representing the different tiers.
 */
export enum Tiers {
  TIER_NONE = 0,
  TIER_BRONZE = 1,
  TIER_SILVER = 2,
  TIER_GOLD = 3,
  TIER_PLATINUM = 4,
  TIER_DIAMOND = 5,
}

export const TiersData = {
  [Tiers.TIER_NONE]: {
    name: "NONE",
    description: "",
    stakeAmount: 0,
    poolWeight: 0,
    unstakeFee: 0,
    benefits: "",
  },
  [Tiers.TIER_BRONZE]: {
    name: "BRONZE",
    description: "Entry level tier for new traders.",
    stakeAmount: 20000000,
    poolWeight: 55,
    unstakeFee: 5,
    benefits: "Pool Weight: 5.5 <br/> Can invest in rounds 1 and 3 <br />Tier unstake fee: 5%",
  },
  [Tiers.TIER_SILVER]: {
    name: "SILVER",
    description: "For active traders.",
    stakeAmount: 100000000,
    poolWeight: 300,
    unstakeFee: 4,
    benefits: "Pool Weight: 300 <br/> Can invest in rounds 1, 2 and 3 <br />Tier unstake fee: 4%",
  },
  [Tiers.TIER_GOLD]: {
    name: "GOLD",
    description: "For serious investors.",
    stakeAmount: 200000000,
    poolWeight: 750,
    unstakeFee: 3,
    benefits: "Pool Weight: 750 <br/> Can invest in rounds 1, 2 and 3 <br />Tier unstake fee: 3%",
  },
  [Tiers.TIER_PLATINUM]: {
    name: "PLATINUM",
    description: "High volume traders.",
    stakeAmount: 800000000,
    poolWeight: 3050,
    unstakeFee: 2,
    benefits: "Pool Weight: 3050 <br/> Can invest in rounds 1, 2 and 3 <br />Tier unstake fee: 2%",
  },
  [Tiers.TIER_DIAMOND]: {
    name: "DIAMOND",
    description: "Elite status.",
    stakeAmount: 3200000000,
    poolWeight: 13750,
    unstakeFee: 1,
    benefits: "Pool Weight: 13750 <br/> Can invest in rounds 1, 2 and 3 <br />Tier unstake fee: 1%",
  },
};

export const TiersDataArray = [
  {
    id: Tiers.TIER_NONE,
    name: "NONE",
    description: "",
    stakeAmount: 0,
    poolWeight: 0,
    unstakeFee: 0,
    benefits: "",
  },
  {
    id: Tiers.TIER_BRONZE,
    name: "BRONZE",
    description: "Entry level tier for new traders.",
    stakeAmount: 20000000,
    poolWeight: 55,
    unstakeFee: 5,
    benefits: "Pool Weight: 5.5 <br/> Can invest in rounds 1 and 3 <br />Tier unstake fee: 5%",
  },
  {
    id: Tiers.TIER_SILVER,
    name: "SILVER",
    description: "For active traders.",
    stakeAmount: 100000000,
    poolWeight: 300,
    unstakeFee: 4,
    benefits: "Pool Weight: 300 <br/> Can invest in rounds 1, 2 and 3 <br />Tier unstake fee: 4%",
  },
  {
    id: Tiers.TIER_GOLD,
    name: "GOLD",
    description: "For serious investors.",
    stakeAmount: 200000000,
    poolWeight: 750,
    unstakeFee: 3,
    benefits: "Pool Weight: 750 <br/> Can invest in rounds 1, 2 and 3 <br />Tier unstake fee: 3%",
  },
  {
    id: Tiers.TIER_PLATINUM,
    name: "PLATINUM",
    description: "High volume traders.",
    stakeAmount: 800000000,
    poolWeight: 3050,
    unstakeFee: 2,
    benefits: "Pool Weight: 3050 <br/> Can invest in rounds 1, 2 and 3 <br />Tier unstake fee: 2%",
  },
  {
    id: Tiers.TIER_DIAMOND,
    name: "DIAMOND",
    description: "Elite status.",
    stakeAmount: 3200000000,
    poolWeight: 13750,
    unstakeFee: 1,
    benefits: "Pool Weight: 13750 <br/> Can invest in rounds 1, 2 and 3 <br />Tier unstake fee: 1%",
  },
];

/**
 * Type representing a Tier, inferred from the TierSchema.
 * This type defines the structure of a tier based on the Zod schema validation.
 */
export type Tier = z.infer<typeof TierSchema>;
