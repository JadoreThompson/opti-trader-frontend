import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useBodyStyles } from "../hooks/BodyStyles";
import CopyTradeForm from "./CopyTradeForm";

export interface FollowCount {
  count: number;
}

interface Profile {
  username: string;
  followers: FollowCount;
  totalProfit: Number;
  winrate: Number;
  balance: number;
}

const ProfileCard: FC<Profile> = ({
  username,
  followers,
  totalProfit,
  winrate,
  balance,
}) => {
  const bodyStyles = useBodyStyles();
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    <>
      <div className="card container">
        <Link to={`/profile/${username}`}>
          <div className="w-100" style={{ boxSizing: "border-box" }}>
            <div className="img-container profile">
              <img src="" alt="PFP" />
            </div>
            <div className="d-col pt-1">
              <h2>{username}</h2>
              <div className="d-row">
                <svg
                  className="icon"
                  style={{ marginRight: "0.5rem" }}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M11 0H5v2H3v6h2v2h6V8H5V2h6V0zm0 2h2v6h-2V2zM0 14h2v4h12v2H0v-6zm2 0h12v-2H2v2zm14 0h-2v6h2v-6zM15 0h4v2h-4V0zm4 8h-4v2h4V8zm0-6h2v6h-2V2zm5 12h-2v4h-4v2h6v-6zm-6-2h4v2h-4v-2z"
                    fill="currentColor"
                  />{" "}
                </svg>
                <span>{followers.count}</span>
              </div>
            </div>
          </div>
          <div className="d-col border-underline mb-1">
            <div className="d-row justify-sb align-center">
              <span className="secondary small">30d Profit</span>
              <span className="large">
                {totalProfit !== null && totalProfit !== undefined
                  ? String(totalProfit)
                  : "-"}
              </span>
            </div>
            <div className="d-row justify-sb align-center">
              <span className="secondary small">30d Winrate</span>
              <span className="large">
                {winrate !== null && winrate !== undefined
                  ? String(Number(winrate) * 100) + "%"
                  : "-"}
              </span>
            </div>
            <div className="d-row justify-sb align-center">
              <span className="secondary small">AUM</span>
              <span className="large">
                {balance !== null && balance !== undefined
                  ? String(balance)
                  : "-"}
              </span>
            </div>
          </div>
        </Link>
        <div className="w-100">
          <button
            className="btn primary border-radius-2 w-100"
            onClick={() => {
              setShowForm(true);
            }}
          >
            Copy
          </button>
        </div>
      </div>
      {showForm ? (
        <CopyTradeForm
          username={username}
          visible={showForm}
          setVisible={(arg: boolean) => {
            setShowForm(arg);
          }}
        />
      ) : null}
    </>
  );
};

export default ProfileCard;
