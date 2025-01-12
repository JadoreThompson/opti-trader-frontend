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
      e.key === "Escape" ? setShow(false) : null;
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

  useEffect(() => {
    function displayOptions(e: Event): void {
      const element = (e.target as HTMLElement).closest(".sidebar-item")!;
      const nextElement = element.nextElementSibling as HTMLElement;

      if (nextElement.classList.contains("sidebar-options")) {
        nextElement.style.display =
          nextElement.style.display === "flex" ? "none" : "flex";
      }
    }

    const elements = document.querySelectorAll(".sidebar-item");

    if (elements) {
      elements.forEach((element) => {
        element.addEventListener("click", displayOptions);
      });
    }

    return () => {
      if (elements) {
        elements.forEach((element) => {
          element.removeEventListener("click", displayOptions);
        });
      }
    };
  }, []);

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
          d="M20 5H4v2h16V5zm-8 4H4v2h8V9zm8 4v2H4v-2h16zm-8 4H4v2h8v-2z"
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
            <div className="sidebar-item cursor-pointer" id="profile">
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
          <div className="sidebar-item cursor-pointer" id="trade">
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
          <div
            className="d-col sidebar-options d-none cursor-pointer"
            style={{ marginLeft: "1rem" }}
          >
            <Link to="/trade/spot">
              <div className="w-100 align-center mb-1 mt-1">
                <svg
                  className="icon"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M11 2h2v4h6v2H7v3H5V6h6V2zM5 18h6v4h2v-4h6v-2H5v2zm14-7H5v2h12v3h2v-5z"
                    fill="currentColor"
                  />{" "}
                </svg>
                <span style={{ marginLeft: "0.5rem" }}>Spot</span>
              </div>
            </Link>
            <Link to="/trade/futures">
              <div className="w-100 align-center mb-1 mt-1 cursor-pointer">
                <svg
                  className="icon"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M6 2h10v2H6V2zM4 6V4h2v2H4zm0 12H2V6h2v12zm2 2H4v-2h2v2zm12 0H6v2h12v-2zm2-2v2h-2v-2h2zm0 0h2V8h-2v10zM12 6H8v2H6v8h2v2h8v-2h2v-4h-2v4H8V8h4V6zm2 8v-4h2V8h2V6h4V4h-2V2h-2v4h-2v2h-2v2h-4v4h4z"
                    fill="currentColor"
                  />{" "}
                </svg>
                <span style={{ marginLeft: "0.5rem" }}>Futures</span>
              </div>
            </Link>
          </div>
          <div className="sidebar-icon-container cursor-pointer">
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
