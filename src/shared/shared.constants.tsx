import { RiDiscordFill, /*RiMediumFill, RiTelegramFill,*/ RiTwitterXFill } from "react-icons/ri";

export const MODULE_SHARED = "shared";

/**
 * Navigation menu items for the application.
 * Each item contains a title and a path.
 */
export const navigationMenu = [
  {
    title: "Swap",
    path: "/swap",
  },
  {
    title: "Perps",
    path: "/perp",
  },
  {
    title: "Lend",
    path: "/lend",
  },
  {
    title: "Predict",
    path: "/predict",
  },
  {
    title: "Stake",
    path: "/stake",
  },
  /*
  {
    title: "Leaderboard",
    path: "/leaderboard",
  },
  {
    title: "Stats",
    path: "/stats",
  },
  */
];

/**
 * Array of social network links and their corresponding icons.
 * Used to display social media links in the application.
 *
 * @type {Array<{path: string, icon: JSX.Element}>}
 * @property {string} path - The URL of the social network
 * @property {JSX.Element} icon - React icon component for the social network
 */
export const socialNetworks = [
  {
    path: "https://discordapp.com/channels/768887649540243497/1315796419826683975",
    icon: <RiDiscordFill />,
  },
  /*
  {
    path: "https://telegram.com",
    icon: <RiTelegramFill />,
  },
  {
    path: "https://medium.com",
    icon: <RiMediumFill />,
  },
  */
  {
    path: "https://x.com/NostromoPad",
    icon: <RiTwitterXFill />,
  },
];
