import axios from "axios";
import { FC, useEffect, useState } from "react";
import RequestBuilder from "../utils/RequestBuilder";

const performanceKeys: Record<string, string> = {
  winrate: "Winrate",
  std: "Standard Deviation",
  beta: "Beta",
  sharpe: "Sharpe",
  treynor: "Tryenor",
  ahpr: "AHPR",
  ghpr: "GHPR",
  risk_of_ruin: "Risk of Ruin",
};

const PerformanceCard: FC<{ username: string | null }> = ({ username }) => {
  const [followData, setFollowData] = useState<null | Record<
    string,
    Record<string, any>
  >>(null);
  const [performanceData, setPerformanceData] = useState<null | Record<
    string,
    string | number
  >>(null);

  useEffect(() => {
    (async () => {
      try {
        setPerformanceData(
          await axios
            .get(
              RequestBuilder.getBaseUrl() +
                `/portfolio/performance?username=${username}`,
              RequestBuilder.constructHeader()
            )
            .then((response) => {
              return response.data;
            })
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await axios.get(
        RequestBuilder.getBaseUrl() + "/accounts/metrics",
        RequestBuilder.constructHeader()
      );
      setFollowData(data);
    })();
  }, []);

  return (
    <>
      <div className="card">
        <h2>Performance</h2>
        {!(performanceData !== null && followData !== null) ? null : (
          <>
            <div className="d-row justify-sb">
              {Number((performanceData["total_profit"] as string).slice(1)) >=
              0 ? (
                <>
                  <span className="large positive">
                    +{performanceData["total_profit"]}
                  </span>
                </>
              ) : (
                <>
                  <span className="large negative">
                    -{performanceData["total_profit"]}
                  </span>
                </>
              )}

              <span className="large">{performanceData["balance"]}</span>
            </div>
            <div className="d-row justify-sb mb-1">
              <div className="dotted-bottom">
                <span className="secondary">Gains</span>
              </div>
              <div className="dotted-bottom">
                <span className="secondary">Balance</span>
              </div>
            </div>
            <div className="d-row justify-sb mb-05">
              <span className="secondary">Followers</span>
              <span>{followData["followers"]["count"]}</span>
            </div>
            <div className="d-row justify-sb mb-05">
              <span className="secondary">Following</span>
              <span>{followData["followers"]["count"]}</span>
            </div>
            {Object.keys(performanceKeys).map((key) => (
              <>
                <div className="d-row justify-sb mb-05">
                  <span className="secondary">{performanceKeys[key]}</span>
                  <span>{performanceData[key]}</span>
                </div>
              </>
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default PerformanceCard;
