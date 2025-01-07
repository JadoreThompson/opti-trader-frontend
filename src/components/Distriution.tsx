import { FC, useEffect } from "react";
import RequestBuilder from "../utils/RequestBuilder";
import axios from "axios";

const Distribution: FC = () => {
  useEffect(() => {
    (async () => {
      console.log(
        await axios.get(
          RequestBuilder.getBaseUrl() + "/portfolio/distribution",
          RequestBuilder.constructHeader()
        )
      );
    })();
  }, []);
  return <p>Dis</p>;
};
export default Distribution;
