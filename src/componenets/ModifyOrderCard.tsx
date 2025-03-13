import { Value } from "@sinclair/typebox/value";
import { FC, RefObject, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { ModifyOrderRequest } from "../utils/ValidationTypes";
import { MarketType, OrderStatus, OrderType } from "../utils/types";

const ModifyOrderCard: FC<{
  data: Record<string, string | null | number>;
  setOrders: (
    arg:
      | Record<string, any>[]
      | ((arg: Record<string, any>[]) => Record<string, any>[])
  ) => void;
  order_type: OrderType;
  marketType: MarketType;
  setShow: (arg: boolean) => void;
  allowClose?: boolean;
}> = ({
  data,
  setOrders,
  order_type,
  marketType,
  setShow,
  allowClose = true,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [showClose, setShowClose] = useState<boolean>(false);

  const cancelRef = useRef<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const modifyAudioRef = useRef<HTMLAudioElement>(null);
  const closeAudioRef = useRef<HTMLAudioElement>(null);

  function shakeCard(): void {
    if (cardRef.current) {
      cardRef.current.classList.remove("shake");
      void cardRef.current.offsetWidth;
      cardRef.current.classList.add("shake");
    }
  }

  function playMusic(audioRef: RefObject<HTMLAudioElement>): void {
    audioRef.current!.volume = 0.25;
    audioRef.current!.play();
  }

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
            playMusic(modifyAudioRef!);
          }
        } catch (err) {
          setErrorMsg((err as Error).message);
          shakeCard();
        }
      }
    } else {
    }
  }

  async function submitCloseOrderRequest(): Promise<void> {
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

      if (closeAudioRef.current) {
        playMusic(closeAudioRef);
      }

      setShowClose(false);
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  }

  async function submitCancelOrderRequest(): Promise<void> {
    try {
      const rsp = await fetch(import.meta.env.VITE_BASE_URL + "/order/cancel", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: data.order_id }),
      });

      if (!rsp.ok) {
        const data = await rsp.json();
        throw new Error(data["detail"]);
      }

      removeFromTable(data.order_id as string);
    } catch (err) {}
  }

  function removeFromTable(order_id: string): void {
    setOrders((prev) => prev.filter((order) => order.order_id !== order_id));
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

      {showClose && (
        <>
          <div className="w-full h-full flex-column g-1 align-center bg-background-primary border-radius-primary p-sm">
            {marketType === MarketType.FUTURES && (
              <>
                <span>Are you sure you want to {cancelRef.current ? "cancel" : "close"} this order?</span>
                <div className="w-full flex g-1" style={{ height: "2rem" }}>
                  <button
                    type="button"
                    className="btn btn-white w-full border-none hover-pointer"
                    onClick={() =>
                      cancelRef.current
                        ? submitCancelOrderRequest()
                        : submitCloseOrderRequest()
                    }
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
              </>
            )}

            {errorMsg && (
              <div
                className="w-full flex align-center justify-center"
                style={{ height: "2rem" }}
              >
                <span className="error">{errorMsg}</span>
              </div>
            )}
          </div>
        </>
      )}

      {!showClose && (
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
                <FaXmark />
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
                      defaultValue={data.take_profit ?? undefined}
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
                      defaultValue={data.stop_loss ?? undefined}
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
                      className="w-full h-full bg-background-secondary border-radius-primary p-sm"
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
              {allowClose && (
                <div className="w-full" style={{ height: "2rem" }}>
                  <button
                    className="btn btn-primary border-none hover-pointer w-full h-full"
                    type="button"
                    onClick={() => {
                      cancelRef.current = false;
                      setErrorMsg(undefined);
                      setShowClose(true);
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
              {data.status === OrderStatus.PENDING && (
                <div className="w-full" style={{ height: "2rem" }}>
                  <button
                    className="btn btn-primary border-none hover-pointer w-full h-full"
                    type="button"
                    onClick={() => {
                      cancelRef.current = true;
                      setErrorMsg(undefined);
                      setShowClose(true);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              
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
