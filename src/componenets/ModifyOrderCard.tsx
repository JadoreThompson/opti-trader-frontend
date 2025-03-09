import { Value } from "@sinclair/typebox/value";
import { FC, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ModifyOrderRequest } from "../utils/ValidationTypes";
import { OrderType } from "../utils/types";
import CloseIcon from "./icons/CloseIcon";

const ModifyOrderCard: FC<{
  data: ModifyOrderRequest;
  order_type: OrderType;
  setShow: (arg: boolean) => void;
}> = ({ data, order_type, setShow }) => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [showClose, setShowClose] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const modifyAudioRef = useRef<HTMLAudioElement>(null);
  const closeAudioRef = useRef<HTMLAudioElement>(null);

  async function submitModifyRequest(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    const formData: Record<string, any> = {
      ...Object.fromEntries(
        new FormData(e.target as HTMLFormElement).entries()
      ),
    };

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined) {
        if (formData[key].trim()) {
          formData[key] = Number(formData[key].replace("$", ""));
        } else {
          formData[key] = undefined;
        }
      }
    });

    formData.order_id = data.order_id;

    if (Value.Check(ModifyOrderRequest, formData)) {
      if (JSON.stringify(data) !== JSON.stringify(formData)) {
        try {
          const rsp = await fetch(
            import.meta.env.VITE_BASE_URL + "/order/modify",
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(formData),
            }
          );

          if (!rsp.ok) {
            const rspData = await rsp.json();
            throw new Error(rspData["detail"]);
          }

          if (modifyAudioRef.current) {
            modifyAudioRef.current.volume = 0.25;
            modifyAudioRef.current.play();
          }

          // setShow(false);
        } catch (err) {
          setErrorMsg((err as Error).message);
        }
      }
    } else {
      if (cardRef.current) {
        cardRef.current.classList.remove("shake");
        void cardRef.current.offsetWidth;
        cardRef.current.classList.add("shake");
      }
    }
  }

  async function submitCloseRequest(): Promise<void> {
    try {
      const rsp = await fetch(import.meta.env.VITE_BASE_URL + "/order/close", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: data.order_id }),
      });

      if (!rsp.ok) {
        const data = await rsp.json();
        throw new Error(data["detail"]);
      }

      console.log(rsp);

      if (closeAudioRef.current) {
        closeAudioRef.current.volume = 0.25;
        closeAudioRef.current.play();
      }

      // setShow(false);
      setShowClose(false);
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  }

  return (
    <>
      <audio
        ref={modifyAudioRef}
        src="../src/assets/music/coin-sound.mp3"
        className="hidden"
        style={{ width: 0, height: 0 }}
      ></audio>
      <audio
        ref={closeAudioRef}
        src="../src/assets/music/coin-sound-2.mp3"
        className="hidden"
        style={{ width: 0, height: 0 }}
      ></audio>
      {showClose ? (
        <>
          {ReactDOM.createPortal(
            <div
              className="overlay-container flex align-center justify-center"
              style={{ backdropFilter: "blur(1px)" }}
            >
              <div className="flex-column g-1 align-center bg-background-primary border-radius-primary p-sm">
                <span>Are you sure you want to close this order?</span>
                <div className="w-full flex g-1" style={{ height: "2rem" }}>
                  <button
                    type="button"
                    className="btn btn-white w-full border-none hover-pointer"
                    onClick={() => submitCloseRequest()}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className="btn bg-transparent w-full border-default hover-pointer"
                    onClick={() => setShowClose(false)}
                  >
                    No
                  </button>
                </div>
                {errorMsg && (
                  <div
                    className="w-full flex align-center justify-center"
                    style={{ height: "2rem" }}
                  >
                    <span className="error">{errorMsg}</span>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
        </>
      ) : (
        <>
          <div
            ref={cardRef}
            className="modify-order-card w-full h-full bg-background-primary border-radius-primary p-sm"
          >
            <div
              className="w-full flex align-center justify-end"
              style={{ height: "1.5rem" }}
            >
              <div
                className="w-auto h-full hover-pointer"
                onClick={() => setShow(false)}
              >
                <CloseIcon size="100%" />
              </div>
            </div>
            <form
              id="modifyOrderForm"
              className="flex-column g-1"
              onSubmit={submitModifyRequest}
            >
              <div
                className="w-full flex g-2 justify-between"
                style={{ height: "3.5rem" }}
              >
                <div className="w-full h-full flex-column g-1">
                  <div className="w-full" style={{ height: "1rem" }}>
                    <label htmlFor="takeProfit">Take Profit</label>
                  </div>
                  <div className="w-full" style={{ height: "2rem" }}>
                    <input
                      type="number"
                      name="take_profit"
                      step={0.01}
                      id="takeProfit"
                      className="w-full bg-background-secondary p-sm border-radius-primary"
                      style={{ height: "2rem" }}
                      defaultValue={data.take_profit}
                    />
                  </div>
                </div>
                <div className="w-full h-full flex-column g-1">
                  <div className="w-full" style={{ height: "1rem" }}>
                    <label htmlFor="stopLoss">Stop Loss</label>
                  </div>
                  <div className="w-full" style={{ height: "2rem" }}>
                    <input
                      type="number"
                      name="stop_loss"
                      step={0.01}
                      id="stopLoss"
                      className="w-full bg-background-secondary p-sm border-radius-primary"
                      style={{ height: "2rem" }}
                      defaultValue={data.stop_loss}
                    />
                  </div>
                </div>
              </div>
              {order_type === OrderType.LIMIT && (
                <div className="w-full" style={{ height: "3.5rem" }}>
                  <div className="w-full" style={{ height: "1.25rem" }}>
                    <label htmlFor="limitPrice">Limit Price</label>
                  </div>
                  <div className="w-full" style={{ height: "2rem" }}>
                    <input
                      className="w-full h-full bg-background-secondary border-radius-primary"
                      type="number"
                      name="limit_price"
                      id="limitPrice"
                      step={0.01}
                    />
                  </div>
                </div>
              )}
              <div className="w-full" style={{ height: "2rem" }}>
                <button
                  className="btn btn-blue border-none hover-pointer w-full h-full"
                  type="submit"
                >
                  Modify
                </button>
              </div>
              <div className="w-full" style={{ height: "2rem" }}>
                <button
                  className="btn btn-primary border-none hover-pointer w-full h-full"
                  type="button"
                  onClick={() => {
                    setErrorMsg(undefined);
                    setShowClose(true);
                  }}
                >
                  Close
                </button>
              </div>
              <div className="w-full" style={{ height: "2rem" }}>
                <span>{data.order_id}</span>
              </div>
              {errorMsg && (
                <div
                  className="w-full flex align-center justify-center"
                  style={{ height: "2rem" }}
                >
                  <span className="error">{errorMsg}</span>
                </div>
              )}
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default ModifyOrderCard;
