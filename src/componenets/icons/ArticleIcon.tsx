import { FC } from "react";
import { IconProps } from "../../utils/utils";

const ArticleIcon: FC<IconProps> = ({
  className,
  fill = "var(--color)",
  size = "100px",
}) => {
  return (
    <svg
      className={className}
      height={size}
      width={size}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        d="M5 3H3v18h18V3H5zm14 2v14H5V5h14zm-2 2H7v2h10V7zM7 11h10v2H7v-2zm7 4H7v2h7v-2z"
        fill={fill}
      />
    </svg>
  );
};

export default ArticleIcon;
