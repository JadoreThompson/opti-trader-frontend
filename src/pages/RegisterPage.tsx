import { FC, FormEvent, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";

const RegisterPage: FC = () => {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    if (passwordRef.current?.value !== confirmPasswordRef.current?.value) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const rsp = await fetch(import.meta.env.VITE_BASE_URL + "/api/register", {
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

      const data = await rsp.json();
      if (!rsp.ok) throw new Error(data["error"]);

      toast.success("Registered successfully");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="w-full h-full flex align-center justify-center">
        <form
          className=" flex-col g-2 p-md"
          onSubmit={handleSubmit}
          //   style={{ backgroundColor: "red" }}
        >
          <input
            type="text"
            placeholder="Username"
            name="username"
            className="w-full"
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            className="w-full"
          />
          <input
            ref={passwordRef}
            type="password"
            name="password"
            placeholder="Password"
            className="w-full"
          />
          <input
            ref={confirmPasswordRef}
            type="password"
            placeholder="Confirm password"
            className="w-full"
          />
          <button type="submit" className="btn btn-primary w-full">
            Register
          </button>
        </form>
      </div>
    </>
  );
};

export default RegisterPage;
