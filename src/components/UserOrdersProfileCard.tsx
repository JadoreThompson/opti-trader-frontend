import axios from "axios";
import { FC, useEffect, useState } from "react";
import "../index.css";
import { MarketType, OrderStatus } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

const tableHeaders: Record<string, string> = {
  ticker: "Ticker",
  filled_price: "Entry Price",
  close_price: "Exit Price",
  realised_pnl: "Realised PnL",
};

const futuresTableHeaders: Record<string, string> = {
  ...tableHeaders,
  ...{
    side: "Position Type",
  },
};

const UserOrdersProfileCard: FC<{
  username: string | null;
  marketType: MarketType;
  orderStatus: (typeof OrderStatus)[keyof typeof OrderStatus];
}> = ({ username, marketType, orderStatus }) => {
  const pageSize = 10;

  const [revealTable, setRevealTable] = useState<boolean>(false);
  const [data, setData] = useState<
    null | Record<string, null | string | Number>[]
  >(null);
  const [sortedData, setSortedData] = useState<
    null | Record<string, null | string | Number>[]
  >(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [maxPages, setMaxPages] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/portfolio/orders?order_status=${orderStatus}&market_type=${marketType}${
                username ? `&username=${username}` : ""
              }`,
            RequestBuilder.constructHeader()
          )
          .then((response) => response.data)
          .catch((err) => {
            if (err instanceof axios.AxiosError) {
              console.error(err);
            }
            return null;
          })
      );
    })();
  }, [username, marketType, orderStatus]);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  useEffect(() => {
    setCurrentIndex(0);

    if (sortedData) {
      if (sortedData.length > 0) {
        setMaxPages(Math.floor(sortedData.length / pageSize) + 1);
        setRevealTable(true);
        return;
      }
    }

    setRevealTable(false);
    return;
  }, [sortedData]);

  const getCellClass: (key: string, value: string | Number) => string = (
    key: string,
    value: string | Number
  ): string => {
    if (key === "realised_pnl") {
      return Number(value) < 0 ? "negative" : "positive";
    }
    return "";
  };

  const changeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (Number((e.target as HTMLButtonElement).value) === -1) {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    } else {
      if (currentIndex < maxPages - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  return (
    <>
      <div
        className={`card container user-orders profile ${
          revealTable ? "d-col" : ""
        }`}
      >
        {!revealTable ? (
          <>
            <div
              // className="h-100 w-100 d-col justify-center"
              style={{
                height: "100%",
                maxHeight: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <svg
                className="icon large"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M17 2h-2v2H9V2H7v2H3v18h18V4h-4V2zM7 6h12v2H5V6h2zM5 20V10h14v10H5zm6-4H9v2h2v-2zm0-2v-2H9v2h2zm2 0h-2v2h2v2h2v-2h-2v-2zm0 0v-2h2v2h-2z"
                  fill="currentColor"
                />{" "}
              </svg>
              <div className="justify-center">
                <span className="large secondary">No data</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <table className="w-100 h-100" cellSpacing={0}>
              <thead>
                <tr>
                  {Object.values(
                    marketType === MarketType.SPOT
                      ? tableHeaders
                      : futuresTableHeaders
                  ).map((value, index) => (
                    <th key={index} className="secondary">
                      {value}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData!
                  .slice(currentIndex, currentIndex + pageSize)!
                  .map((order, index) => (
                    <tr key={index}>
                      {Object.keys(
                        marketType === MarketType.SPOT
                          ? tableHeaders
                          : futuresTableHeaders
                      ).map((key) => (
                        <td
                          key={key}
                          className={`underline ${getCellClass(
                            key,
                            order[key]!
                          )}`}
                        >
                          {key === "realised_pnl"
                            ? Number(order[key]!) < 0
                              ? `${String(order[key])} USDT`
                              : `+${String(order[key])} USDT`
                            : String(order[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="justify-center mt-1 g-1">
              <button
                value={-1}
                className="btn rounded"
                onClick={changeIndex}
                disabled={currentIndex == 0}
              >
                Previous
              </button>
              <button
                value={1}
                className="btn rounded"
                onClick={changeIndex}
                disabled={currentIndex >= maxPages - 1}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UserOrdersProfileCard;
