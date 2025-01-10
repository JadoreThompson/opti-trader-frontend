import { FC, useEffect, useState } from "react";
import { MarketType, OrderStatus } from "../types/CommonTypes";
import OrdersTableTemp from "./OrdersTableTemp";

const tabs: Record<
  number,
  Record<string, null | string | OrderStatus[] | MarketType[]>
> = {
  0: {
    title: "Open Positions",
    orderStatus: [
      OrderStatus.FILLED,
      OrderStatus.PARTIALLY_FILLED,
      OrderStatus.PARTIALLY_CLOSED_ACTIVE,
    ],
    marketType: [MarketType.FUTURES],
  },

  1: {
    title: "Open Orders",
    orderStatus: [
      OrderStatus.FILLED,
      OrderStatus.PARTIALLY_FILLED,
      OrderStatus.PARTIALLY_CLOSED_ACTIVE,
    ],
    marketType: [MarketType.SPOT],
  },

  2: {
    title: "History",
    orderStatus: [OrderStatus.CLOSED],
    marketType: [MarketType.SPOT, MarketType.FUTURES],
  },
};

const OrderFolder: FC<{ ticker: undefined | string }> = ({ ticker }) => {
  const [statusList, setStatusList] = useState<null | OrderStatus[]>(null);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [marketType, setMarketType] = useState<null | MarketType[]>(null);

  useEffect(() => {
    setMarketType(tabs[currentTab]["marketType"] as MarketType[]);
    setStatusList(tabs[currentTab]["orderStatus"] as OrderStatus[]);
  }, [currentTab]);

  return (
    <>
      <div className="card container">
        <div className="tab-bar mb-1">
          {Object.keys(tabs).map((key, ind) => (
            <button
              className={`btn ${currentTab === Number(key) ? "active" : ""}`}
              key={ind}
              onClick={() => setCurrentTab(Number(key))}
            >
              <span className="secondary">
                {tabs[Number(key)]["title"] as string}
              </span>
            </button>
          ))}
        </div>
        <OrdersTableTemp
          ticker={ticker}
          marketType={marketType}
          orderStatus={statusList}
        />
      </div>
    </>
  );
};

export default OrderFolder;
