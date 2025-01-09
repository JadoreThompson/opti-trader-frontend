import axios from "axios";
import { FC, useState } from "react";
import { setCookie } from "typescript-cookie";
import RequestBuilder from "../utils/RequestBuilder";

const Login: FC<{ setIsLoggedIn: (arg: boolean) => void }> = ({
  setIsLoggedIn,
}) => {
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  async function formHandler(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        RequestBuilder.getBaseUrl() + "/accounts/login",
        Object.fromEntries(new FormData(e.target as HTMLFormElement).entries())
      );

      localStorage.setItem("username", data.username);
      setCookie("jwt", data.token);
      setIsLoggedIn(true);
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        setErrorMessage(err.response?.data.error);
      }
    }
  }

  return (
    <div className=" container d-col" style={{ boxSizing: "border-box" }}>
      <h1>Login</h1>
      <form onSubmit={formHandler}>
        <div className="w-100">
          <label htmlFor="email" className="secondary small">
            Email
          </label>
          <input
            type="email"
            className="w-100 rounded"
            style={{ boxSizing: "border-box" }}
            name="email"
            id="email"
            required
          />
        </div>
        <div className="w-100">
          <label htmlFor="password" className="secondary small">
            Password
          </label>
          <input
            type="password"
            className="w-100 rounded"
            style={{ boxSizing: "border-box" }}
            name="password"
            id="password"
            required
          />
        </div>
        <div className="w-100">
          <button type="submit" className="btn w-100 rounded">
            Submit
          </button>
        </div>
        {errorMessage && (
          <div className="w-100">
            <span className="error">{errorMessage}</span>
          </div>
        )}
      </form>
      <div className="w-100 everything-center mt-1">
        <span style={{ marginRight: "0.1rem" }}>Don't have an account?</span>
        <a style={{ color: "blue" }} href="/auth/register">
          Register
        </a>
      </div>
    </div>
  );
};

export default Login;
