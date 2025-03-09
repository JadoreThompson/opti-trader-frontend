import { FC } from "react";

const ViewListIcon: FC<{
  className?: string;
  fill?: string;
  size?: string;
}> = ({ className = "", fill = "white", size = "100px" }) => {
  return (
    <svg
      fill={fill}
      className={className}
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      {" "}
      <path
        d="M2 5h20v14H2V5zm2 2v2h16V7H4zm16 4H4v2h16v-2zm0 4H4v2h16v-2z"
        fill={fill}
      />{" "}
    </svg>
  );
};

export default ViewListIcon;
