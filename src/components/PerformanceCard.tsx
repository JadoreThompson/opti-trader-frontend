import axios from "axios";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const PerformanceCard: FC<{ username: string }> = ({ username }) => {
  const navigate = useNavigate();

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
      setPerformanceData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/portfolio/performance?${
                username ? `username=${username}` : ""
              }`,
            RequestBuilder.constructHeader()
          )
          .then((response) => {
            // console.log(response.data);
            return response.data;
          })
          .catch((err) => {
            console.error(err);
            if (err instanceof axios.AxiosError) {
              if (err.response?.status === 403) {
                navigate("/404", { replace: false });
              }
            }
            return null;
          })
      );
    })();
  }, [username]);

  useEffect(() => {
    (async () => {
      setFollowData(
        await axios
          .get(
            RequestBuilder.getBaseUrl() +
              `/accounts/metrics?${username ? `username=${username}` : ""}`,
            RequestBuilder.constructHeader()
          )
          .then((response) => response.data)
          .catch((err) => {
            if (err instanceof axios.AxiosError) {
              if (err.response?.status === 403) {
                navigate("/404", { replace: false });
              }
            }
            return null;
          })
      );
    })();
  }, [username]);

  return (
    <>
      <div className="card performance">
        <h2>Performance</h2>
        {!(performanceData !== null && followData !== null) ? (
          <>
            <div className="h-100 w-100 everything-center">
              <span className="large secondary">No data</span>
            </div>
          </>
        ) : (
          <>
            <div className="d-row justify-sb">
              {Number((performanceData["total_profit"] as string)?.slice(1)) >=
              0 ? (
                <>
                  <span key={0} className="large positive">
                    +{performanceData["total_profit"]}
                  </span>
                </>
              ) : (
                <>
                  <span key={1} className="large negative">
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
            {Object.keys(performanceKeys).map((key, index) => (
              <div key={index} className="d-row justify-sb mb-05">
                <span className="secondary">{performanceKeys[key]}</span>
                <span>{performanceData[key]}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default PerformanceCard;
