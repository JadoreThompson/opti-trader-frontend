import axios from "axios";
import React, { FC, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "typescript-cookie";

// Local
import Sidebar from "../components/Sidebar";

const imgUrl: string =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDw7HXLDZfXQoJReyeHR8IqyPYAp6RWpjs4Dp9MwZ49HoJl2RsXRTGxqnUlzPgtFTbsA7a2upeCQeyPg-2w5qEmpBOxlPkqbfGv48AFW1OyNZ6WIuZt5dI-NVtflu1NPjqE8oJUi4I57oMVtiAStrRnmgjjAf5WQ6_sbd8UYoDhloMBdSRnpIgjY6EdOML/s1920/photo_6291852644980997101_w.jpg";

const Follow: FC = () => {
  const reqHeader: Record<string, Record<string, string>> = {
    headers: {
      Authorization: `Bearer ${getCookie("jwt")}`,
    },
  };

  const [users, setUsers] = useState<Array<string>>([]);
  const queryRef = useRef<string>("");
  const pageNumRef = useRef<number>(0);

  const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    console.log("handle called");
    try {
      const { data } = await axios.get(
        `http://127.0.0.1:8000/accounts/search?prefix=${e.target.value}`,
        reqHeader
      );
      queryRef.current = e.target.value;
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const onVisible: (element: HTMLElement | null, callback: any) => void = (
    element: HTMLElement | null,
    callback: any
  ): void => {
    new IntersectionObserver((entries: Array<any>, observer) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          console.log("end");
          callback();
          observer.disconnect();
        }
      });
    }).observe(element!);
  };

  // useEffect(() => {
  //   const element = document.getElementById('root') as HTMLElement;
  //   // element.style.overflow = 'hidden';
  // }, []);

  useEffect(() => {
    const element: HTMLElement = document.querySelector(
      "section#footer"
    ) as HTMLElement;

    let leave: boolean = true;

    const callback: () => void = async (): Promise<void> => {
      pageNumRef.current += 1;

      if (queryRef.current != 'dpg') {
        let url: string = `http://127.0.0.1:8000/accounts/search?prefix=${queryRef.current}&page=${pageNumRef.current}`;

        try {
          const { data } = await axios.get(url, reqHeader);

          setUsers((prev) => {
            return [...prev, ...data];
          });

          data.length > 0 ? (leave = false) : (leave = true);
        } catch (e) {
          console.error(e);
        }
        
        !leave ? onVisible(element, callback) : null;
      }

    };

    onVisible(element, callback);
  }, []);

  return (
    <Sidebar
      mainContent={
        <>
          <div
            className="container flex results"
            style={{ flexDirection: "column", paddingBottom: '5rem' }}
          >
            <div className="container">
              <input
                type="text"
                placeholder="Search..."
                style={{
                  border: "1px solid grey",
                  borderRadius: "0.25rem",
                  margin: 0,
                  padding: '0.5rem',
                  fontSize: "1.5rem",
                }}
                onChange={handleChange}
              />
            </div>
            {users.map((user) => (
              <Link key={user} to={`/dashboard/profile/${user}`}>
                <div className="container flex w-100 search-result">
                  <div className="profile img-container title-group small">
                    <img src="#" />
                  </div>
                  <div className="username">
                    <span>{user}</span>
                  </div>
                </div>
              </Link>
            ))}
            <section id="footer"></section>
          </div>
        </>
      }
    />
  );
};

export default Follow;
