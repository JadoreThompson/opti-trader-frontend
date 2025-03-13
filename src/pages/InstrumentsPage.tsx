import { FC, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaXmark,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import CustomHeader from "../componenets/CustomHeader";
import DefaultLayout from "../componenets/DefaultLayout";
import { useIsLoggedIn } from "../contexts/useIsLoggedIn";

interface InstrumentObject {
  name: string;
  price: number;
}

interface PaginatedInstruments {
  instruments: InstrumentObject[];
  has_next_page: boolean;
}

const InstrumentsPage: FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useIsLoggedIn();

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [instruments, setInstruments] = useState<
    InstrumentObject[] | undefined
  >(undefined);
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const tablePageRef = useRef<number[]>([]);
  const maxPageSize = 10;

  useEffect(() => {
    (async () => {
      const data = await fetchInstruments();
      if (data) {
        setInstruments(data.instruments);
        setHasNextPage(data.has_next_page);
      }
    })();
  }, []);

  useEffect(() => {
    if (page < 1) return;

    if (tablePageRef.current.includes(page)) {
      return;
    }

    (async () => {
      const data = await fetchInstruments();

      if (data) {
        setInstruments((prev) => [...prev!, ...data.instruments]);
        setHasNextPage(data.has_next_page);
        if (!data.has_next_page) {
          setLastPage(page);
        }
      }
      tablePageRef.current.push(page);
    })();
  }, [page]);

  async function fetchInstruments(): Promise<PaginatedInstruments | null> {
    try {
      const rsp = await fetch(
        import.meta.env.VITE_BASE_URL + `/instrument/list?page=${page - 1}`,
        { method: "GET", credentials: "include" }
      );
      const data = await rsp.json();

      if (!rsp.ok) {
        throw new Error(data["detail"]);
      }

      return data as PaginatedInstruments;
    } catch (err) {
      return null;
    }
  }

  async function createInstrument(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    const formData: Record<string, any> = Object.fromEntries(
      new FormData(e.target as HTMLFormElement).entries()
    );
    formData["price"] = Number(formData["price"]);

    try {
      const rsp = await fetch(
        import.meta.env.VITE_BASE_URL + "/instrument/create",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!rsp.ok) {
        const data = await rsp.json();
        throw new Error(data["detail"]);
      }

      navigate(`/futures/${formData.name}`);
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  }

  return (
    <>
      <CustomHeader />
      {showCreateForm && (
        <>
          {ReactDOM.createPortal(
            <>
              <div className="overlay-container flex align-center justify-center">
                <div className="bg-background-primary border-radius-primary p-sm relative">
                  <div
                    className="absolute flex align-center justify-center"
                    style={{ top: 0, right: 0, height: "2rem", width: "2rem" }}
                  >
                    <FaXmark
                      size="55%"
                      className="hover-pointer"
                      onClick={() => setShowCreateForm(false)}
                    />
                  </div>
                  <form className="flex-column g-2" onSubmit={createInstrument}>
                    <div className="w-full" style={{ height: "3.5rem" }}>
                      <div style={{ height: "1.5rem" }}>
                        <label htmlFor="name" className="span-lg">
                          Name
                        </label>
                      </div>
                      <div style={{ height: "2rem" }}>
                        <input
                          type="text"
                          className="bg-background-secondary border-radius-primary p-sm w-full h-full"
                          name="name"
                          id="name"
                        />
                      </div>
                    </div>
                    <div className="w-full" style={{ height: "3.5rem" }}>
                      <div style={{ height: "1.5rem" }}>
                        <label htmlFor="price" className="span-lg">
                          Starting Price
                        </label>
                      </div>
                      <div style={{ height: "2rem" }}>
                        <input
                          type="number"
                          className="bg-background-secondary border-radius-primary p-sm w-full h-full"
                          name="price"
                          id="price"
                          step={0.01}
                        />
                      </div>
                    </div>
                    <div className="w-full" style={{ height: "2rem" }}>
                      <button
                        type="submit"
                        className="btn btn-white border-none hover-pointer w-full h-full"
                      >
                        CREATE
                      </button>
                    </div>
                  </form>
                  {errorMsg && (
                    <div
                      className="w-full flex align-center justify-center"
                      style={{ height: "2rem" }}
                    >
                      <span className="error">{errorMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body
          )}
        </>
      )}
      <DefaultLayout
        element={
          <>
            <h1 className="mb-3">Pairs</h1>
            <div
              className="w-full h-full justify-start"
              style={{ maxHeight: "30rem" }}
            >
              <div
                className="w-full flex justify-end align-center p-sm"
                style={{ height: "3rem" }}
              >
                <button
                  className="btn btn-green border-none hover-pointer h-full"
                  style={{ height: "2rem" }}
                  onClick={() =>
                    isLoggedIn ? setShowCreateForm(true) : navigate("/login")
                  }
                >
                  Create
                </button>
              </div>
              {instruments ? (
                <>
                  <table
                    className="w-full"
                    style={{ height: "calc(100% - 3rem)" }}
                  >
                    <thead className="bg-background-secondary w-full border-radius-primary flex">
                      <tr className="p-xs border-radius-primary bg-background-secondary w-full flex justify-between">
                        <th>Ticker</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody className="flex-column p-xs scroll-hidden">
                      {instruments!
                        .slice((page - 1) * maxPageSize, page * maxPageSize + 1)
                        .map((value, ind) => (
                          <tr
                            key={ind}
                            className="instrument-record flex justify-between hover-pointer hover-bg-background-secondary p-sm"
                            style={{ borderBottom: "1px solid #262629" }}
                            onClick={() => {
                              window.location.href = `/futures/${value.name}`;
                            }}
                          >
                            <td>{value.name}</td>
                            <td>{value.price}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div
                    className="w-full flex justify-end"
                    style={{ height: "2rem" }}
                  >
                    <div className="w-auto h-full flex justify-between align-center">
                      <button
                        type="button"
                        className="btn bg-transparent border-none h-full flex justify-center align-center hover-pointer"
                        onClick={() => {
                          if (page <= 1) return;
                          setPage(page - 1);
                          setHasNextPage(true);
                        }}
                      >
                        <FaChevronLeft fill="white" size="1.5rem" />
                      </button>
                      <span className="span-lg">{page}</span>
                      <button
                        type="button"
                        className="btn bg-transparent border-none h-full flex justify-center align-center hover-pointer"
                        onClick={() => {
                          if (hasNextPage) {
                            if (lastPage) {
                              if (page >= lastPage) {
                                return;
                              }
                            }
                            setPage(page + 1);
                          }
                        }}
                      >
                        <FaChevronRight fill="white" size="1.5rem" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="w-full h-full flex align-center justify-center border-radius-primary border-default"
                  style={{ backgroundColor: "#262629" }}
                >
                  <div className="flex-column g-3 align-center justify-center">
                    <FaSpinner className="spin-load" />
                    <span className="span-lg">No Instruments</span>
                  </div>
                </div>
              )}
            </div>
          </>
        }
      />
    </>
  );
};

export default InstrumentsPage;
