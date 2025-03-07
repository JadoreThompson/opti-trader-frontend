import { FC, FormEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthPageLayout from "../componenets/AuthPageLayout";
import { IsLoggedInContext } from "../contexts/IsLoggedInContext";

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(IsLoggedInContext);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    try {
      const rsp = await fetch(import.meta.env.VITE_BASE_URL + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(
          Object.fromEntries(
            new FormData(e.target as HTMLFormElement).entries()
          )
        ),
      });

      if (!rsp.ok) throw new Error(rsp.statusText);

      toast.success("Logged in successfully");
      setIsLoggedIn(true);
      navigate("/");
    } catch (err) {}
  }

  return (
    <AuthPageLayout
      imgSrc="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3NuamhyNzA3NzJmNDh3dHBhaXJ0NWl2YjRtb2QzaTAycG43M2wzaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/spZMbmQAIaL2bYp2uP/giphy.gif"
      content={
        <div className="flex-column" style={{ width: "30rem" }}>
          <div className="w-100 flex align-center justify-center">
            <h1>Login</h1>
          </div>
          <form className="flex-column p-md" onSubmit={handleSubmit}>
            <input
              style={{ fontSize: "1rem" }}
              type="email"
              placeholder="Email"
              name="email"
              className="w-full bg-background-secondary border-radius-primary p-sm mb-1"
            />
            <input
              style={{ fontSize: "1rem" }}
              type="password"
              name="password"
              placeholder="Password"
              className="w-full bg-background-secondary border-radius-primary p-sm mb-1"
            />
            <div className="mb-4" style={{ height: "1rem" }}>
              <button
                type="submit"
                className="btn btn-primary border-none hover-pointer w-full h-full"
              >
                Enter
              </button>
            </div>
            <div className="w-full">
              <span>
                Don't have an account?
                <a
                  href="/register"
                  className="underline"
                  style={{ color: "rgb(109, 200, 250)" }}
                >
                  Register
                </a>
              </span>
            </div>
          </form>
        </div>
      }
    />
  );
};

export default LoginPage;
