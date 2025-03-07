import { FC } from "react";
import { ToastContainer } from "react-toastify";

const AuthPageLayout: FC<{ content: JSX.Element, imgSrc: string; }> = ({ content, imgSrc }) => {
  return (
    <>
      <ToastContainer />
      <div className="w-full h-full flex">
        <div className="h-full w-half p-md auth-img-container">
          <div className="w-full h-full border-radius-primary overflow-hidden">
            <img
              className="h-full w-full cover"
              src={imgSrc}
              alt=""
            />
          </div>
        </div>
        <div className="h-full w-half flex align-center justify-center auth-form-container">
          {content}
        </div>
      </div>
    </>
  );
};

export default AuthPageLayout;
