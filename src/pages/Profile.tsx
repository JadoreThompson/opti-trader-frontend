import { FC, useEffect, useState } from "react";

// Local
import { useLocation } from "react-router-dom";
import AssetAllocation from "../components/AssetAllocation";
import Header from "../components/Header";
import PerformanceCard from "../components/PerformanceCard";
import PortfolioGrowthCard from "../components/PortfolioGrowthCard";
import UserOrdersProfileCard from "../components/UserOrdersProfileCard";
import WeekdayGains from "../components/WeekdayGains";
import { MarketType, OrderStatus } from "../types/CommonTypes";

const imgUrl: string =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDw7HXLDZfXQoJReyeHR8IqyPYAp6RWpjs4Dp9MwZ49HoJl2RsXRTGxqnUlzPgtFTbsA7a2upeCQeyPg-2w5qEmpBOxlPkqbfGv48AFW1OyNZ6WIuZt5dI-NVtflu1NPjqE8oJUi4I57oMVtiAStrRnmgjjAf5WQ6_sbd8UYoDhloMBdSRnpIgjY6EdOML/s1920/photo_6291852644980997101_w.jpg";

const Profile: FC = () => {
  const location = useLocation();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [currentMarketType, setCurrentMarketType] = useState<MarketType>(
    MarketType.SPOT
  );

  useEffect(() => {
    const storedUser: string = localStorage.getItem("username")!;
    const pathUser: string = location.pathname.split("/")[2];
    setDisplayName(pathUser);
    storedUser === pathUser ? null : setUsername(pathUser);
  }, []);

  return (
    <>
      <Header
        content={
          <>
            <div className="global-layout">
              <div className="global-layout-inner">
                <div className="d-row mb-3">
                  <div className="btn-radio-group">
                    {Object.values(MarketType).map((value, index) => (
                      <button
                        key={index}
                        className={`btn ${
                          currentMarketType === value ? "active" : ""
                        }`}
                        value={value}
                        onClick={(e) => {
                          setCurrentMarketType(
                            (e.target as HTMLButtonElement).value as MarketType
                          );
                        }}
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="d-row header profile mb-3">
                  <div className="img-container profile" style={{ flex: 2 }}>
                    <img className="" src={imgUrl} alt="" />
                  </div>
                  <div className="d-col pt-1" style={{ flex: 6 }}>
                    <div className="b-0">
                      <div>
                        <h1 id="username">{displayName}</h1>
                      </div>
                      <div>
                        <span className="secondary small" id="bio">
                          Charting my way to success 📈 | Trader by passion,
                          analyst by profession 💼
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1" style={{ flex: 2 }}>
                    <button
                      className="btn primary br-secondary"
                      style={{ width: "100%" }}
                    >
                      Follow
                    </button>
                  </div>
                </div>
                <div>
                  <div className="tab-bar underline">
                    <button className="btn active">
                      <span className="secondary">Overview</span>
                    </button>
                    <button className="btn">
                      <span className="secondary">Performance</span>
                    </button>
                    <button className="btn">
                      <span className="secondary">Orders</span>
                    </button>
                  </div>
                </div>
                <div>
                  <PortfolioGrowthCard
                    username={username}
                    marketType={currentMarketType}
                  />
                  <PerformanceCard
                    username={username!}
                    marketType={currentMarketType}
                  />
                  <AssetAllocation
                    username={username}
                    marketType={currentMarketType}
                  />
                  <WeekdayGains
                    username={username}
                    marketType={currentMarketType}
                  />
                  <UserOrdersProfileCard
                    username={username}
                    marketType={currentMarketType}
                    orderStatus={OrderStatus.CLOSED}
                  />
                </div>
              </div>
            </div>
          </>
        }
      />
    </>
  );
};

export default Profile;
