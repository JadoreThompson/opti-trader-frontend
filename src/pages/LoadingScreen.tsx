import { FC, useEffect, useState } from "react";
import {
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
} from "react-icons/fa6";
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
        {option === 0 && <FaBatteryQuarter size="100%" />}

        {option === 1 && <FaBatteryHalf size="100%" />}

        {option === 2 && <FaBatteryFull size="100%" />}
      </div>
    </div>
  );
};

export default LoadingScreen;
