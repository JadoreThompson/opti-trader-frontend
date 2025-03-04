import { FC, useEffect, useState } from "react";
import BatteryFull from "../componenets/icons/BatteryFull";
import BatteryLow from "../componenets/icons/BatteryLow";
import BatteryMedium from "../componenets/icons/BattryMedium";
import UtilsManager from "../utils/classses/UtilsManager";

const LoadingScreen: FC<{ stop: boolean }> = ({ stop }) => {
  const [option, setOption] = useState<number>(0);

  useEffect(() => {
    (async () => {
      while (!stop) {
        await UtilsManager.sleep(500);
        setOption((prev) => (prev === 2 ? 0 : prev + 1));
      }
    })();
  }, [stop]);

  return (
    <div className={`overlay-container flex align-center justify-center`}>
      <div
        className="flex align-center justify-center"
        style={{ height: "10rem" }}
      >
        {option === 0 && <BatteryLow size="100%" />}

        {option === 1 && <BatteryMedium size="100%"/>}

        {option === 2 && <BatteryFull size="100%" />}
      </div>
    </div>
  );
};

export default LoadingScreen;
