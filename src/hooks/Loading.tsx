import { FC, useEffect, useState } from "react";
import Utility from "../utils/Utility";

const Loading: FC<{
  isRunning: boolean;
  setIsRunning: (arg: boolean) => void;
}> = ({ isRunning, setIsRunning }) => {
  const [num, setNum] = useState<number>(0);

  useEffect(() => {
    (async () => {
      for (let i = 0; i < 30; i++) {
        await Utility.sleep(1000);
        if (!isRunning) break;
        setNum((prev) => (prev === 2 ? 0 : prev + 1));
      }
    })();

    return () => {
      setIsRunning(false);
    };
  }, [isRunning]);

  return (
    <>
      <div className="overlay-container d-flex bg-primary">
        <div className="w-100 h-100 d-flex align-center justify-center">
          {isRunning ? (
            num === 0 ? (
              <svg
                className="icon large"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M4 5H2v14h18v-4h2V9h-2V5H4zm14 2v10H4V7h14zM8 9H6v6h2V9z"
                  fill="currentColor"
                />{" "}
              </svg>
            ) : num === 1 ? (
              <svg
                className="icon large"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M4 5H2v14h18v-4h2V9h-2V5H4zm14 2v10H4V7h14zM6 9h2v6H6V9zm6 0h-2v6h2V9z"
                  fill="currentColor"
                />{" "}
              </svg>
            ) : num === 2 ? (
              <svg
                className="icon large"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M18 5H2v14h18v-4h2V9h-2V5h-2zm0 2v10H4V7h14zM8 9H6v6h2V9zm2 0h2v6h-2V9zm6 0h-2v6h2V9z"
                  fill="currentColor"
                />{" "}
              </svg>
            ) : null
          ) : null}
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default Loading;
