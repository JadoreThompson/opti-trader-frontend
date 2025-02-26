import { FC } from "react";
import { Profile } from "../pages/AccountPage";
import UtilsManager from "../utils/classses/UtilsManager";
import Coin from "./icons/Coin";
import WalletIcon from "./icons/WalletIcon";

const TradingHeader: FC<{
  // avatar: string;
  // balance: number;
  // username: string;
  profile?: Profile;
}> = ({
  // avatar,
  // balance,
  // username
  profile,
}) => {
  if (!profile) {
    profile = {
      avatar:
        "https://i.seadn.io/s/primary-drops/0xa06096e4640902c9713fcd91acf3d856ba4b0cc8/34399034:about:preview_media:b9117ca9-c56a-4c69-b3bf-5ec2d1ff3493.gif?auto=format&dpr=1&w=2048",
      email: "john@doe.com",
      username: "john_doe",
      balance: 1000,
    };
  }

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
                {UtilsManager.formatPrice(profile.balance)}
              </span>
            </div>
            <div className="h-full w-auto flex align-center">
              <WalletIcon size="100%" />
            </div>
          </div>
        </div>
        <div className="h-full w-full flex justify-end">
          <a
            href={`/user/${profile.username}`}
            className="h-full flex align-center g-1 border-radius-primary p-xs hover-pointer"
          >
            <div
              className="border-radius-primary h-full overflow-hidden"
              style={{ width: "2rem" }}
            >
              <img
                src={profile.avatar}
                alt=""
                className="h-full w-full cover"
              />
            </div>
            <span className="bold span-lg">{profile.username}</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default TradingHeader;
