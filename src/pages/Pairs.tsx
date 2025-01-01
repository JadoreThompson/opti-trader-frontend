import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Pairs: FC = () => {
  const [tokens, setTokens] = useState<Array<Record<string, string | number>>>(
    []
  );

  useEffect(() => {
    setTokens([
      {
        pair: "BTC/USD",
        price: "48,000",
        created: "2025-01-01 12:00:00",
        volume: "1,200",
      },
      {
        pair: "ETH/USD",
        price: "3,200",
        created: "2025-01-01 11:59:00",
        volume: "4,500",
      },
      {
        pair: "LTC/USD",
        price: "150",
        created: "2025-01-01 11:58:30",
        volume: "900",
      },
      {
        pair: "XRP/USD",
        price: "0.75",
        created: "2025-01-01 11:58:00",
        volume: "8,000",
      },
    ]);
  }, []);

  return (
    <Sidebar
      mainContent={
        <>
          <div className="container pairs-container">
            <div className="card flex">
              <div className="card-body">
                <table>
                  <thead>
                    <tr>
                      <th>Pair</th>
                      <th>Price</th>
                      <th>Created</th>
                      <th>Volume</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((row, index) => (
                      <tr key={index}>
                        <td>
                          <Link
                            to={`/trade/${(() => {
                              row.pair = row.pair.toString().replace("/", "-");
                              return row.pair;
                            })()}`}
                          >
                            {row.pair}
                          </Link>
                        </td>
                        <td>{row.price}</td>
                        <td>{row.created}</td>
                        <td>{row.volume}</td>
                        <td
                          style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div className="tooltip-container">
                            <span className="tooltip">Favourite</span>
                            <button
                              onClick={(e) => {}}
                              className="tooltip-icon"
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                              }}
                            >
                              <i className="fa-regular fa-star"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
};
export default Pairs;
