import axios from "axios";
import { FC, useEffect, useState } from "react";
import Header from "../components/Header";
import ProfileCard from "../components/ProfileCard";
import { MarketType } from "../types/CommonTypes";
import RequestBuilder from "../utils/RequestBuilder";

const imgUrl: string =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDw7HXLDZfXQoJReyeHR8IqyPYAp6RWpjs4Dp9MwZ49HoJl2RsXRTGxqnUlzPgtFTbsA7a2upeCQeyPg-2w5qEmpBOxlPkqbfGv48AFW1OyNZ6WIuZt5dI-NVtflu1NPjqE8oJUi4I57oMVtiAStrRnmgjjAf5WQ6_sbd8UYoDhloMBdSRnpIgjY6EdOML/s1920/photo_6291852644980997101_w.jpg";

const FollowTemp: FC = () => {
  const [data, setData] = useState<null | Record<
    string,
    null | string | Record<string, number | string[]>
  >>(null);
  const [page, setPage] = useState<number>(0);
  const [marketType, setMarketType] = useState<MarketType>(MarketType.SPOT);

  useEffect(() => {
    (async () => {
      setData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/accounts/users?page=${page}&market_type=${marketType}`,
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
  }, [page]);

  return (
    <>
      <Header
        content={
          <>
            {data === null ? (
              <p>Follow</p>
            ) : (
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
          </>
        }
      />
    </>
  );
};

export default FollowTemp;
