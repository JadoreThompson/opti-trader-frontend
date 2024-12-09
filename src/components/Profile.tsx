import React, { FC, useState, useEffect, MouseEventHandler } from 'react';
import { getCookie } from 'typescript-cookie';
import axios from 'axios';

// Local
import PortfolioPage from './PortfolioPage';

const imgUrl: string = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDw7HXLDZfXQoJReyeHR8IqyPYAp6RWpjs4Dp9MwZ49HoJl2RsXRTGxqnUlzPgtFTbsA7a2upeCQeyPg-2w5qEmpBOxlPkqbfGv48AFW1OyNZ6WIuZt5dI-NVtflu1NPjqE8oJUi4I57oMVtiAStrRnmgjjAf5WQ6_sbd8UYoDhloMBdSRnpIgjY6EdOML/s1920/photo_6291852644980997101_w.jpg";

const ProfilePage: FC = () => {
    const [isUsersProfile, setIsUsersProfile] = useState<boolean>(true);
    const [username, setUsername] = useState<string>('zenz');

    const toggleOverlay: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>):void => {
        const card = document.querySelector('.overlay-card') as HTMLElement;
        const styles = window.getComputedStyle(card);
        
        if (styles.display === 'none') { card.style.display= 'flex'; }
        else if (styles.display === 'flex') { card.style.display= 'none'; }
    };


    useEffect(() => {
        const header: HTMLElement = document.querySelector('.main-content') as HTMLElement;
        header.classList.add('profile');
        const styles: Array<HTMLElement> = [];

        const style = document.createElement('style');
        style.innerHTML = `
            .profile::before {
                background-image: url(${imgUrl});
            }
        `;

        styles.push(style);

        if (isUsersProfile) {
            const editProfileStyle: HTMLElement = document.createElement('style');
            
            editProfileStyle.innerHTML = `
                .edit-profile-card .card .container.header-img {
                    border: 2px solid grey;
                    border-radius: 0.5rem;
                    height: 10rem;
                    background-image: url(${imgUrl});
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }
            `;
            styles.push(editProfileStyle);
        }

        styles.forEach(item => document.head.appendChild(item));

        return () => {
            header.classList.remove('profile');
            styles.forEach(item => document.head.removeChild(item));
        }
    }, []);

    // useEffect(() => {
    //     const fetchData: () => void = async (): Promise<void> => {
    //         const { data } = await axios.get("", {
    //             headers: { 'Authorization': `Bearer ${getCookie('jwt')}`}
    //         })
    //     };

    //     fetchData();
    // }, []);


    return (<>
        <div className="overlay-card edit-profile-card">
            <div className="container">
                <div className="card">
                    <div className="card-title" style={{ 
                        display: 'flex', flexDirection: 'row', justifyContent: 'space-between'
                    }}>
                        <button className="transparent" onClick={toggleOverlay}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <button className="btn btn-primary" style={{ width: 'auto' }}>Save</button>
                    </div>
                    <div 
                        className="container header-img" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',  
                        }}>
                            <div 
                                className="transparent" 
                                style={{ 
                                    backgroundColor: 'rgba(235, 194, 215, 0.6)', 
                                    borderRadius: '10rem', 
                                    width: '5rem', 
                                    height: '5rem',
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center'
                            }}>
                                <i className="fa-solid fa-camera" style={{ fontSize: '2rem' }}></i>
                            </div>                        
                    </div>

                    <div className="card-body" style={{ display: 'flex', flexDirection:'column', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="profile img-container title-group">
                            <img src={imgUrl} alt="" />
                        </div>
                        <div className="container">
                            <form>
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="container profile-container">
            <div className="inner-card">
                <div className="card flex">
                    <div className="card-title">
                        <div className="row">
                            <div className="profile img-container title-group">
                                <img src={imgUrl} alt="" />
                            </div>
                            <div className="title-group">
                                <span id="username">{username}</span>
                            </div>
                        </div>
                        <div className="row info">
                            <div className="container">
                                <div className="title-info-item">
                                    <div className="title-info-header">
                                        <span>Followers</span>
                                    </div>
                                    <div className="title-info-content">
                                        <span>10k</span>
                                    </div>
                                </div>
                                <div className="title-info-item">
                                    <div className="title-info-header">
                                        <span>Following</span>
                                    </div>
                                    <div className="title-info-content">
                                        <span>100</span>
                                    </div>
                                </div>
                            </div>
                            {
                                isUsersProfile
                                ? (
                                    <>
                                        <div className="container">
                                            <button onClick={toggleOverlay} className="btn btn-secondary">Edit Profile</button>
                                            <i className="fa-solid fa-gear"></i>
                                        </div>
                                    </>
                                )
                                :null
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <PortfolioPage />
    </>)
};


export default ProfilePage;
