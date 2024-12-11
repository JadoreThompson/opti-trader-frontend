import { FC, MouseEventHandler, useEffect, useState } from 'react';
import Profile from './Profile';


const imgUrl: string = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDw7HXLDZfXQoJReyeHR8IqyPYAp6RWpjs4Dp9MwZ49HoJl2RsXRTGxqnUlzPgtFTbsA7a2upeCQeyPg-2w5qEmpBOxlPkqbfGv48AFW1OyNZ6WIuZt5dI-NVtflu1NPjqE8oJUi4I57oMVtiAStrRnmgjjAf5WQ6_sbd8UYoDhloMBdSRnpIgjY6EdOML/s1920/photo_6291852644980997101_w.jpg";

const Follow: FC = () => {    
    const [username, setUsername] = useState<string | null>(null);

    const showProfile = (e: React.MouseEvent<HTMLDivElement>) => {
        const username: string | null = (e.target as HTMLElement)
            .closest('.search-result')!
            .querySelector(".username span")!
            .textContent;
        setUsername(username);
    };

    return (
        <>
        {
            username 
            ? (<Profile isUsersProfile={false} user={username!} />)
            : ( <>
            
                    <div className="container flex">
                        <div className="container justify-center" style={{ width: "50%", margin: 'auto' }}>
                            <div className="container flex w-100 m-2" style={{ alignItems: 'center', borderRadius: '0.5rem', border: '1px solid grey', padding: '0.5rem' }}>
                                <input type="text" placeholder='Search...' style={{ border: 'none', margin: 0, padding: 0 }}/>
                                <button className="transparent">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>
                            <div className="container body">
                                <div className="container flex w-100 search-result" onClick={showProfile}>
                                    <div className="profile img-container title-group small">
                                        <img src={imgUrl} alt="" />
                                    </div>
                                    <div className="username">
                                        <span>zenz</span>
                                    </div>
                                </div>
                                <div className="container flex w-100 search-result" onClick={showProfile}>
                                    <div className="profile img-container title-group small">
                                        <img src={imgUrl} alt="" />
                                    </div>
                                    <div className="username"><span>Moreno</span></div>
                                </div>
                                <div className="container flex w-100 search-result" onClick={showProfile}>
                                    <div className="profile img-container title-group small">
                                        <img src={imgUrl} alt="" />
                                    </div>
                                    <div className="username"><span>max</span></div>
                                </div>
                                <div className="container flex w-100 search-result" onClick={showProfile}>
                                    <div className="profile img-container title-group small">
                                        <img src={imgUrl} alt="" />
                                    </div>
                                    <div className="username"><span>alan</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )
        }
        </>
    )
};

export default Follow;
