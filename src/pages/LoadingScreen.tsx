import { FC, useEffect, useState } from "react";
import {
  FaBatteryEmpty,
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
        setOption((prev) => (prev === 3 ? 0 : prev + 1));
      }
    })();
  }, [stop]);

  return (
    <div className={`overlay-container flex align-center justify-center`}>
      <div
        className="flex align-center justify-center"
        style={{ height: "10rem" }}
      >
        {option === 0 && <FaBatteryEmpty size="5rem" />}
        {option === 1 && <FaBatteryQuarter size="5rem" />}
        {option === 2 && <FaBatteryHalf size="5rem" />}
        {option === 3 && <FaBatteryFull size="5rem" />}
      </div>
    </div>
  );
};

export default LoadingScreen;
