import { FC } from "react";
import { Link } from "react-router-dom";

const Login: FC<{
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}> = ({ handleSubmit }) => {
  return (
    <div className="container auth-container">
      <div className="card auth-card">
        <div className="card-title">
          <h1>Login</h1>
        </div>
        <form id="loginForm" onSubmit={handleSubmit}>
          <input type="text" name="email" placeholder="Email" required />
          <input type="text" name="password" placeholder="Password" required />
          <button className="btn btn-primary">Login</button>
        </form>
        <div className="card-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/auth/register" replace={true}>
              Register
            </Link>
          </p>
          <p
            style={{ color: "red", textAlign: "center" }}
            id="errorMessage"
          ></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
