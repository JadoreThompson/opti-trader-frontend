import { Value } from "@sinclair/typebox/value";
import { FC, RefObject, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import UtilsManager from "../utils/classses/UtilsManager";

import { useProfile } from "../contexts/useProfile";
import { OrderRequest } from "../utils/ValidationTypes";
import { MarketType } from "../utils/types";
import FuturesOrderCard from "./FuturesOrderCard";
import SpotOrderCard from "./SpotOrderCard";

enum OrderType {
  MARKET = "market",
  LIMIT = "limit",
}

export function playMusic(audioRef: RefObject<HTMLAudioElement>): void {
  if (!audioRef.current!.paused) {
    audioRef.current!.pause();
  }
  audioRef.current!.volume = 0.25;
  audioRef.current!.play();
}

const OrderCard: FC<{ marketType: MarketType; instrument: string }> = ({
  marketType,
  instrument,
}) => {
  const { setProfile } = useProfile();
  const [selectedOrderType, setSelectedOrderType] = useState<
    OrderType | undefined
  >(undefined);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function placeTrade(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    if (selectedOrderType === undefined) {
      UtilsManager.toastError("Please select an order type");
      return;
    }

    let payload: Record<any, any> = {
      ...(Object.fromEntries(
        new FormData(e.target as HTMLFormElement).entries()
      ) as unknown as OrderRequest),
      order_type: selectedOrderType!,
      side: ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)
        .value as "long" | "short",
    };

    ["limit_price", "stop_loss", "take_profit", "quantity"].forEach((key) => {
      if (typeof payload[key] == "string") {
        payload[key] = Number(payload[key]);
      }
    });

    payload["side"] = payload["side"] === "long" ? "buy" : "sell";
    payload["instrument"] = instrument;
    payload["market_type"] = marketType;

    if (Value.Check(OrderRequest, payload)) {
      try {
        const rsp = await fetch(import.meta.env.VITE_BASE_URL + "/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await rsp.json();
        if (!rsp.ok) throw new Error(data["detail"]);

        if (audioRef.current) {
          playMusic(audioRef);
        }
        UtilsManager.toastSuccess("Order placed");
        setProfile((prev) => ({ ...prev!, balance: data.balance }));
      } catch (err) {
        UtilsManager.toastError((err as Error).message);
      }
    }
  }

  function changeMarketType(arg: MarketType): void {
    let parts: string[] = window.location.pathname.split("/");
    parts[1] = arg;
    window.location.href = parts.join("/");
  }

  return (
    <>
    <audio
        ref={audioRef}
        src="../src/assets/music/coin-sound.mp3"
        className="hidden"
        style={{ width: 0, height: 0 }}
      ></audio>
      <ToastContainer />
      {marketType === MarketType.FUTURES ? (
        <FuturesOrderCard
          marketType={marketType}
          submitHandler={placeTrade}
          selectedOrderType={selectedOrderType}
          setSelectedOrderType={setSelectedOrderType}
          changeMarketType={changeMarketType}
        />
      ) : (
        <SpotOrderCard
          instrument={instrument}
          marketType={marketType}
          submitHandler={placeTrade}
          selectedOrderType={selectedOrderType}
          setSelectedOrderType={setSelectedOrderType}
          changeMarketType={changeMarketType}
        />
      )}
    </>
  );
};

export default OrderCard;
