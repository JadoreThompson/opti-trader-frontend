import { FC, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: FC = () => {
  const location = useLocation();
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const options: Record<string, string> = {
      follow: "follow",
      profile: "profile",
      leaderboard: "leadberboard",
      trade: "trade",
    };

    document
      .getElementById(options[location.pathname.split("/")[1]])
      ?.classList.add("active");
  }, [location.pathname]);

  useEffect(() => {
    const element = document.querySelector(".sidebar-container") as HTMLElement;

    function hide(e: KeyboardEvent): void {
      e.key === 'Escape' ? setShow(false) : null
    }

    if (show) {
      if (element) {
        element.setAttribute("tabIndex", "0");
        element.focus();
        element.addEventListener("keydown", hide);
      }
    }

    return () => {
      if (element) {
        element.removeEventListener("keydown", hide);
      }
    };
  }, [show]);

  return (
    <>
      <svg
        className="icon"
        onClick={() => setShow(true)}
        style={{
          display: show ? "none" : "block",
          margin: 0,
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        {" "}
        <path
          d="M20 5H4v2h16V5zm0 4H4v2h16V9zM4 13h16v2H4v-2zm16 4H4v2h16v-2z"
          fill="currentColor"
        />{" "}
      </svg>
      <div className={`sidebar-container ${show ? "active" : ""}`}>
        <div className={`sidebar ${show ? "active" : ""}`}>
          <div
            onPointerUp={() => {
              setShow(false);
            }}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "1rem",
            }}
          >
            <svg
              className="icon"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {" "}
              <path
                d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z"
                fill="currentColor"
              />{" "}
            </svg>
          </div>
          <Link to={`/profile/${localStorage.getItem("username")}`}>
            <div className="sidebar-item" id="profile">
              <svg
                className="icon"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M15 2H9v2H7v6h2V4h6V2zm0 8H9v2h6v-2zm0-6h2v6h-2V4zM4 16h2v-2h12v2H6v4h12v-4h2v6H4v-6z"
                  fill="currentColor"
                />{" "}
              </svg>
              <span>Profile</span>
            </div>
          </Link>
          <Link to="/trade">
            <div className="sidebar-item" id="trade">
              <svg
                className="icon"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M14 6h8v8h-2v-4h-2V8h-4V6zm2 6v-2h2v2h-2zm-2 2v-2h2v2h-2zm-2 0h2v2h-2v-2zm-2-2h2v2h-2v-2zm-2 0v-2h2v2H8zm-2 2v-2h2v2H6zm-2 2v-2h2v2H4zm0 0v2H2v-2h2z"
                  fill="currentColor"
                />{" "}
              </svg>
              <span>Trade</span>
            </div>
          </Link>
          <div className="sidebar-icon-container">
            <Link to="/leaderboard">
              <div className="sidebar-item" id="leaderboard">
                <svg
                  className="icon"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M16 3H6v2H2v10h6V5h8v10h6V5h-4V3h-2zm4 4v6h-2V7h2zM6 13H4V7h2v6zm12 2H6v2h12v-2zm-7 2h2v2h3v2H8v-2h3v-2z"
                    fill="currentColor"
                  />{" "}
                </svg>
                <span>Leaderboard</span>
              </div>
            </Link>
          </div>
          <div className="sidebar-icon-container">
            <Link to="/follow">
              <div className="sidebar-item" id="follow">
                <svg
                  className="icon"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M18 2h-6v2h-2v6h2V4h6V2zm0 8h-6v2h6v-2zm0-6h2v6h-2V4zM7 16h2v-2h12v2H9v4h12v-4h2v6H7v-6zM3 8h2v2h2v2H5v2H3v-2H1v-2h2V8z"
                    fill="currentColor"
                  />{" "}
                </svg>
                <span>Follow</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
