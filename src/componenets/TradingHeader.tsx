import { FC } from "react";
import UtilsManager from "../classses/UtilsManager";
import Coin from "./icons/Coin";
import Wallet from "./icons/Wallet";

const TradingHeader: FC<{
  avatar: string;
  balance: number;
  username: string;
}> = ({ avatar, balance, username }) => {
  return (
    <header
      style={{
        height: "3rem",
        borderBottom: "1px solid var(--background-color-secondary)",
      }}
    >
      <div className="w-full h-full j-between flex-row p-xs">
        <div className="h-full w-full">
          <img src="src/assets/Logo.png" alt="" className="h-full" />
        </div>
        <div className="h-full w-full flex-center">
          <div className="h-full border-bg-secondary border-radius-primary p-xs flex-center g-2">
            <div className="h-full w-auto flex g-1 align-center">
              <Coin size={"100%"} />
              <span className="span-lg bold">
                {UtilsManager.displayNumber(balance)}
              </span>
            </div>
            <div className="h-full w-auto flex align-center">
              <Wallet size="100%" />
            </div>
          </div>
        </div>
        <div className="h-full w-full flex justify-end">
          <div className="h-full flex align-center g-1 border-radius-primary p-xs hover-pointer">
            <div
              className="border-radius-primary h-full overflow-hidden"
              style={{ backgroundColor: "yellow", width: "2rem" }}
            >
              <img src={avatar} alt="" className="h-full w-full cover" />
            </div>
            <span className="bold span-lg">{username}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TradingHeader;
