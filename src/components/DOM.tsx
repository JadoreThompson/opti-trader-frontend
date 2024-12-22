import { FC } from "react";

const DOM: FC<{
  asks: Record<number, number>;
  bids: Record<number, number>;
}> = ({ asks, bids }) => {
  return (
    <div
      className="card"
      style={{
        width: '100%',
        display: `${
          Object.keys(asks).length > 0 || Object.keys(bids).length > 0
            ? "flex"
            : "none"
        }`,
      }}
    >
      <table>
        <thead>
          <tr>
            <th>Bids</th>
            <th>Price</th>
            <th>Asks</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(asks).map(([price, quantity]) => (
            <>
              <tr key={price}>
                <td></td>
                <td>{price}</td>
                <td className="asks">{quantity}</td>
              </tr>
            </>
          ))}
          {Object.entries(bids).map(([price, quantity]) => (
            <>
              <tr key={price}>
                <td className="bids">{quantity}</td>
                <td>{price}</td>
                <td></td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DOM;
