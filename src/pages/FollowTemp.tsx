import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import ProfileCard from "../components/ProfileCard";
import { MarketType } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

const imgUrl: string =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDw7HXLDZfXQoJReyeHR8IqyPYAp6RWpjs4Dp9MwZ49HoJl2RsXRTGxqnUlzPgtFTbsA7a2upeCQeyPg-2w5qEmpBOxlPkqbfGv48AFW1OyNZ6WIuZt5dI-NVtflu1NPjqE8oJUi4I57oMVtiAStrRnmgjjAf5WQ6_sbd8UYoDhloMBdSRnpIgjY6EdOML/s1920/photo_6291852644980997101_w.jpg";

const FollowTemp: FC = () => {
  const [data, setData] = useState<
    null | Record<string, null | string | Record<string, number | string[]>>[]
  >(null);
  const [page, setPage] = useState<number>(0);
  const [marketType, setMarketType] = useState<MarketType>(MarketType.SPOT);
  const [finished, setFinished] = useState<boolean>(false);
  const [customSearch, setCustomSearch] = useState<boolean>(false);
  const [prefix, setPrefix] = useState<null | string>(null);
  const prefixRef = useRef<string>();
  const lastPageNum = useRef<number>(-1);

  useEffect(() => {
    // lastPageNum.current = -1;
    setPage(0);
    setFinished(false);
    setData(null);
  }, [marketType]);

  useEffect(() => {
    if (customSearch) {
      return;
    }

    if (lastPageNum.current === page) {
      return;
    }

    (async () => {
      console.log("called request ");
      try {
        const { data } = await axios.get(
          RequestBuilder.getBaseUrl() +
            `/accounts/users?page=${page}&market_type=${marketType}`,
          RequestBuilder.constructHeader()
        );

        lastPageNum.current = page;

        if (data.length == 0) {
          setFinished(true);
          console.log("none left");
          console.log(`/accounts/users?page=${page}&market_type=${marketType}`);
        }

        setData((prev) => {
          if (prev) {
            return [
              ...prev,
              ...data.filter(
                (item: Record<any, any>) =>
                  !prev.some((p) => p.username === item.username)
              ),
            ];
          } else {
            return data;
          }
        });
      } catch (err) {
        if (err instanceof axios.AxiosError) {
          console.error(err.response?.data.error);
        }
      }
    })();
  }, [page, marketType, customSearch]);

  async function handleSearch(
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    e.preventDefault();
    const element = e.target as HTMLInputElement;
    console.log("handleSearch");
    if (!element.value.trim()) {
      // prefixRef.current = "";
      setPrefix("");
      setPage(0);
      setCustomSearch(false);
      setFinished(false);
      console.log("false");
    } else {
      // prefixRef.current = element.value.trim();
      setPrefix(element.value.trim());
      setCustomSearch(true);
    }
    
    lastPageNum.current = -1;
    try {
      const { data } = await axios.get(
        RequestBuilder.getBaseUrl() +
          `/accounts/search?prefix=${element.value}`,
        RequestBuilder.constructHeader()
      );
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.error(err.response?.data.error);
      }
    }
  }

  useEffect(() => {
    if (!customSearch || !prefix) {
      return;
    }

    if (lastPageNum.current === page) {
      return;
    }

    (async () => {
      try {
        const { data } = await axios.get(
          RequestBuilder.getBaseUrl() +
            `/accounts/search?page=${page}&prefix=${prefix}&market_type=${marketType}`,
          RequestBuilder.constructHeader()
        );
        console.log(data);
          lastPageNum.current = page;
        if (data.length == 0) {
          setFinished(true);
        }

        setData((prev) => {
          if (page === 0) {
            return data;
          }

          if (prev) {
            return [
              ...prev,
              ...data.filter(
                (item: Record<any, any>) =>
                  !prev.some((p) => p.username === item.username)
              ),
            ];
          } else {
            return data;
          }
        });
      } catch (err) {
        if (err instanceof axios.AxiosError) {
          console.error(err.response?.data.error);
        }
      }
    })();
  }, [customSearch, prefix, marketType, page]);

  return (
    <>
      <Header
        content={
          <>
            <div className="global-layout">
              <div className="global-layout-inner" id="followInner">
                <div className="d-row justify-sb align-center mb-2">
                  <div
                    className="btn-radio-group h-100"
                    style={{ height: "100%" }}
                  >
                    {[MarketType.SPOT, MarketType.FUTURES].map(
                      (value, index) => (
                        <button
                          key={index}
                          className={`btn h-100 ${
                            marketType === value ? "active" : ""
                          }`}
                          onClick={() => {
                            setMarketType(value);
                          }}
                        >
                          {value.toUpperCase()}
                        </button>
                      )
                    )}
                  </div>
                  <div
                    className="d-flex align-center border-grey rounded"
                    style={{ border: "1px solid red" }}
                  >
                    <input
                      type="text"
                      className="transparent"
                      onChange={handleSearch}
                    />
                    <svg
                      className="icon"
                      style={{ marginRight: "0.5rem" }}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        d="M14 2H6v2H4v2H2v8h2v2h2v2h8v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2h2V6h-2V4h-2V2zm0 2v2h2v8h-2v2H6v-2H4V6h2V4h8zm0 5v2H6V11h8z"
                        fill="currentColor"
                      />{" "}
                    </svg>
                  </div>
                </div>
                <div className="profile-collection">
                  {data === null ? null : (
                    <>
                      {data!.map((value, index) => (
                        <ProfileCard
                          key={index}
                          username={value.username}
                          followers={value.followers}
                          totalProfit={value.total_profit}
                          winrate={value.winrate}
                          balance={value.balance}
                        />
                      ))}
                    </>
                  )}
                </div>
                {!finished ? (
                  <div className="w-100 mt-1 align-center justify-center">
                    <button
                      className="btn w-100 rounded"
                      id="expandButton"
                      onClick={() => {
                        setPage((prev) => prev + 1);
                      }}
                    >
                      Expand
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        }
      />
    </>
  );
};

export default FollowTemp;
