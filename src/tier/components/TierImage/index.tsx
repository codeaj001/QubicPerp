import classNames from "clsx";
import { RiMedalFill, RiVipDiamondFill, RiTrophyFill } from "react-icons/ri";

import { Tiers } from "@/tier/tier.types";

import styles from "./TierImage.module.scss";

/**
 * Interface for the TierImage component props
 * @interface TierImageProps
 * @property {Tiers} [tier] - The tier level that determines which image to display
 * @property {number} [size=62] - The size of the image container in pixels
 */
interface TierImageProps {
  tier?: Tiers;
  size?: number;
}

/**
 * Displays an image corresponding to a specific tier level
 * @component
 * @param {TierImageProps} props - Component properties
 * @param {Tiers} [props.tier] - The tier level to display
 * @param {number} [props.size=62] - The dimensions of the image container in pixels
 * @returns {JSX.Element | null} A container with the tier image, or null if no tier is specified
 */
export const TierImage: React.FC<TierImageProps> = ({ tier, size = 62 }) => {
  if (!tier) return null;

  const images = {
    [Tiers.TIER_NONE]: null,
    [Tiers.TIER_BRONZE]: <RiMedalFill size={size} color="#CD7F32" />,
    [Tiers.TIER_SILVER]: <RiMedalFill size={size} color="#C0C0C0" />,
    [Tiers.TIER_GOLD]: <RiMedalFill size={size} color="#FFD700" />,
    [Tiers.TIER_PLATINUM]: <RiTrophyFill size={size} color="#E5E4E2" />,
    [Tiers.TIER_DIAMOND]: <RiVipDiamondFill size={size} color="#B9F2FF" />,
  };

  return (
    <div
      className={classNames(styles.container, styles[`tier_${tier}`])}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className={styles.image}>{images[tier]}</div>
    </div>
  );
};
