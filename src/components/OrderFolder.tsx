import { FC, useEffect, useState } from "react";
import { MarketType, OrderStatus } from "../types/CommonTypes";
import OrdersTable from "./OrdersTable";

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
  },

  1: {
    title: "History",
    orderStatus: [OrderStatus.CLOSED],
  },
};

const OrderFolder: FC<{
  ticker: undefined | string;
  currentTab: number;
  setCurrentTab: (arg: number) => void;
  pageMarketType: MarketType;
}> = ({ ticker, currentTab, setCurrentTab, pageMarketType }) => {
  const [statusList, setStatusList] = useState<null | OrderStatus[]>(null);

  useEffect(() => {
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
        <OrdersTable
          ticker={ticker}
          marketType={pageMarketType}
          orderStatus={statusList}
          currentTab={currentTab}
        />
      </div>
    </>
  );
};

export default OrderFolder;
