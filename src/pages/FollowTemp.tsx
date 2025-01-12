import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import ProfileCard from "../components/ProfileCard";
import Loading from "../hooks/Loading";
import { MarketType } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

const imgUrl: string =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDw7HXLDZfXQoJReyeHR8IqyPYAp6RWpjs4Dp9MwZ49HoJl2RsXRTGxqnUlzPgtFTbsA7a2upeCQeyPg-2w5qEmpBOxlPkqbfGv48AFW1OyNZ6WIuZt5dI-NVtflu1NPjqE8oJUi4I57oMVtiAStrRnmgjjAf5WQ6_sbd8UYoDhloMBdSRnpIgjY6EdOML/s1920/photo_6291852644980997101_w.jpg";

const FollowTemp: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [profileData, setProfileData] = useState<
    null | Record<string, null | string | Record<string, number | string[]>>[]
  >(null);
  const [page, setPage] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);
  const [customSearch, setCustomSearch] = useState<boolean>(false);
  const [prefix, setPrefix] = useState<null | string>(null);
  const marketTypeRef = useRef<MarketType>(MarketType.SPOT);

  const [tab, setTab] = useState<number>(0);

  useEffect(() => {
    if (page === 0) {
      setProfileData(null);
      setFinished(false);
    }
  }, [page]);

  useEffect(() => {
    if (customSearch) {
      return;
    }

    (async () => {
      try {
        setIsLoading(true);

        const { data } = await axios.get(
          RequestBuilder.getBaseUrl() +
            `/accounts/users?page=${page}&market_type=${marketTypeRef.current}`,
          RequestBuilder.constructHeader()
        );

        setIsLoading(false);

        if (data.length == 0) {
          console.log(
            `[DATA LENGTH]: ${data.length} [PAGE]: ${page} [MARKET TYPE]: ${marketTypeRef.current}`
          );
          setFinished(true);
        }

        setProfileData((prev) => {
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
  }, [page]);

  useEffect(() => {
    if (customSearch) {
      if (prefix) {
        (async () => {
          const { data } = await axios.get(
            RequestBuilder.getBaseUrl() +
              `/accounts/search?prefix=${prefix}&market_type${marketTypeRef.current}&page=${page}`,
            RequestBuilder.constructHeader()
          );

          if (data.length === 0) {
            setFinished(true);
          }

          setProfileData((prev) => {
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
        })();
      }
    }
  }, [prefix, page, tab]);

  async function handleSearch(
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    e.preventDefault();
    const element = e.target as HTMLInputElement;

    if (!element.value.trim()) {
      setPrefix(null);
      setCustomSearch(false);
      setPage(0);
    } else {
      setProfileData(null);
      setPage(0);
      setCustomSearch(true);
      setPrefix(element.value.trim());
    }
  }

  return (
    <>
      <Header
        content={
          <>
            {isLoading ? (
              <Loading isRunning={isLoading} setIsRunning={setIsLoading} />
            ) : (
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
                              tab === index ? "active" : ""
                            }`}
                            onClick={() => {
                              marketTypeRef.current = value;
                              setPage(0);
                              setTab(index);
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
                    {profileData === null ? null : (
                      <>
                        {profileData!.map((value, index) => (
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
            )}
          </>
        }
      />
    </>
  );
};

export default FollowTemp;
