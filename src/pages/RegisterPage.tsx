import { FC, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthPageLayout from "../componenets/AuthPageLayout";
import UtilsManager from "../utils/classses/UtilsManager";

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    if (passwordRef.current?.value !== confirmPasswordRef.current?.value) {
      UtilsManager.toastError("Passwords don't match");
      return;
    }

    try {
      const rsp = await fetch(
        import.meta.env.VITE_BASE_URL + "/auth/register",
        {
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
        }
      );

      if (!rsp.ok) throw new Error(rsp.statusText);
      navigate("/");
      toast.success("Registered successfully");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <AuthPageLayout
      imgSrc="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWRlYTB6bTF5c2d2dzFjZG90NHhmNmd1MmR1ajdoOHBtMXRiYml1MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PVaSEpyzGhjfJTss9b/giphy.gif"
      content={
        <div className="flex-col" style={{ width: "30rem" }}>
          <div className="w-100 flex align-center justify-center">
            <h1>Register</h1>
          </div>
          <form className="flex-col p-md" onSubmit={handleSubmit}>
            <input
              style={{ fontSize: "1rem" }}
              type="text"
              placeholder="Username"
              name="username"
              className="w-full bg-background-secondary border-radius-primary p-sm mb-1"
            />
            <input
              style={{ fontSize: "1rem" }}
              type="email"
              placeholder="Email"
              name="email"
              className="w-full bg-background-secondary border-radius-primary p-sm mb-1"
            />
            <input
              style={{ fontSize: "1rem" }}
              ref={passwordRef}
              type="password"
              name="password"
              placeholder="Password"
              className="w-full bg-background-secondary border-radius-primary p-sm mb-1"
            />
            <input
              style={{ fontSize: "1rem" }}
              ref={confirmPasswordRef}
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
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
                Already have an account?
                <a
                  href="/login"
                  className="underline"
                  style={{ color: "rgb(109, 200, 250)" }}
                >
                  Login
                </a>
              </span>
            </div>
          </form>
        </div>
      }
    />
  );
};

export default RegisterPage;
