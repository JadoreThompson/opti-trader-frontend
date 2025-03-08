import { Value } from "@sinclair/typebox/value";
import { FC, useRef, useState } from "react";
import { ModifyOrderRequest } from "../utils/ValidationTypes";
import { OrderType } from "../utils/types";
import CloseIcon from "./icons/CloseIcon";

const ModifyOrderCard: FC<{
  data: ModifyOrderRequest;
  order_type: OrderType;
  setShow: (arg: boolean) => void;
}> = ({
  data,
  order_type,
  setShow,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function handleSubmit(
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
          
          if (audioRef.current) {
            audioRef.current.volume = 0.25;
            audioRef.current.play();
          }

          setShow(false);
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

  return (
    <>
      <audio
        ref={audioRef}
        src="../src/assets/music/coin-sound.mp3"
        className="hidden"
        style={{ width: 0, height: 0 }}
      ></audio>
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
        <form id="modifyOrderForm" onSubmit={handleSubmit}>
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
            <div className="w-full" style={{ height: "3rem" }}>
              <div className="w-full" style={{ height: "1rem" }}>
                <label htmlFor="limit_price"></label>
              </div>
              <div className="w-full" style={{ height: "2rem" }}></div>
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
          <div className="w-full">
            <span>{data['order_id']}</span>
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
  );
};

export default ModifyOrderCard;
