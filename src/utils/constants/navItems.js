import { History, Bot, Coins, Settings2, Home } from "lucide-react";
import { NAV_PATHS } from "./paths";

export const NAV_ITEMS = [
  {
    name: "Dashboard",
    icon: <Home />,
    href: NAV_PATHS.DASHBOARD,
  },
  // {
  //   name: "Generate",
  //   icon: <Bot />,
  //   href: NAV_PATHS.GENERATE,
  // },
  // {
  //   name: "History",
  //   icon: <History />,
  //   href: NAV_PATHS.HISTORY,
  // },
  {
    name: "Credits",
    icon: <Coins />,
    href: NAV_PATHS.CREDITS,
  },
  // {
  //   name: "Settings",
  //   icon: <Settings2 />,
  //   href: NAV_PATHS.SETTINGS,
  // },
];
