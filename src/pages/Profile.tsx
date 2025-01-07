import { FC, useEffect, useState } from "react";

// Local
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import PerformanceCard from "../components/PerformanceCard";

const imgUrl: string =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDw7HXLDZfXQoJReyeHR8IqyPYAp6RWpjs4Dp9MwZ49HoJl2RsXRTGxqnUlzPgtFTbsA7a2upeCQeyPg-2w5qEmpBOxlPkqbfGv48AFW1OyNZ6WIuZt5dI-NVtflu1NPjqE8oJUi4I57oMVtiAStrRnmgjjAf5WQ6_sbd8UYoDhloMBdSRnpIgjY6EdOML/s1920/photo_6291852644980997101_w.jpg";

const Profile: FC = () => {
  const location = useLocation();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUser: string = localStorage.getItem("username")!;
    const pathUser: string = location.pathname.split("/")[2];
    storedUser === pathUser ? setUsername(storedUser) : setUsername(pathUser);
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
                    <button className="btn">Futures</button>
                    <button className="btn">Spot</button>
                  </div>
                </div>
                <div className="d-row header profile mb-3">
                  <div className="img-container profile" style={{ flex: 2 }}>
                    <img className="" src={imgUrl} alt="" />
                  </div>
                  <div className="d-col pt-1" style={{ flex: 6 }}>
                    <div className="b-0">
                      <div>
                        <h1 id="username">Dojo</h1>
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
                  <div className="tab-bar">
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
                  <PerformanceCard username={username} />
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
