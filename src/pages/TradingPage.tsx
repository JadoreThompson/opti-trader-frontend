import { FC } from "react";
import TradingHeader from "../componenets/TradingHeader";

const DashboardPage: FC = () => {
  return (
    <div>
      <TradingHeader
        avatar="https://imgs.search.brave.com/xu9bKhtZbi0F4vLYrz2NJ6cyTSaNZK3EXviEZLVNIwY/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYW5n/cnktdGFpLWx1bmct/Y2xvc2UtdXAtZWhr/ZHNoODRiZmwyMXVl/di5qcGc"
        balance={1000}
        username="zenz"
      />
      {/* <a href="#" className="btn btn-primary" >
        LONG
      </a> */}
    </div>
  );
};

export default DashboardPage;
