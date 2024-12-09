import { FC, MouseEventHandler, useEffect, useState } from 'react';
import get from 'axios';
import { getCookie } from 'typescript-cookie';
import axios from 'axios';
import Alert, { AlertTypes } from './Alert';


const LeaderBoard: FC = () => {
    const [leaderboard, setLeaderboard] = useState<Record<string, string | number>>({});
    const [showAlert, setShowAlert] = useState<boolean>(false);
    let targetUsername: string = '';


    const toggleOverlay:(
        arg: MouseEventHandler<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement, HTMLElement>
    ) => void = (
        e: MouseEventHandler<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement, HTMLElement>
    ): void => {
        const tr = (e.target as HTMLElement).closest('tr');
        const card = document.querySelector(".follow-card") as HTMLElement;
        const cardStyles = window.getComputedStyle(card);
        
        if (cardStyles.display === 'none')
        {
            tr!.querySelectorAll("td").forEach(
                item => item.getAttribute('data-key') === 'username' 
                ? targetUsername = item.textContent!
                : null
            );
                
            (card.querySelector('.title h2') as HTMLElement).textContent = `Follow ${targetUsername.split('@')[0]}'s trades`;

            card.style.display = 'flex';
        } else if (cardStyles.display === 'flex')
        {
            card.style.display = 'none';
        }

    };


    const submitFormHandler: (arg: React.FormEvent<HTMLFormElement>) => Promise<void> = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const formData: Record<string, string | boolean> = Object.fromEntries(
            Array.from(new FormData(e.target as HTMLFormElement).entries()).map(
                ([key, _]) => [key, true]
            )
        );

        if (Object.keys(formData).length >= 1) { 
            if (targetUsername) {
                try
                {
                    formData['username'] = targetUsername;
                
                    const { status } = await axios.post(
                        "http://127.0.0.1:8000/portfolio/copy", 
                        formData, 
                        { headers: { 'Authorization': `Bearer ${getCookie('jwt')}` }}
                    );
                
                    if (status === 200) { setShowAlert(true); }

                } catch (e)
                {
                    if (e instanceof axios.AxiosError)
                    {
                        (document.getElementById("errorMessage") as HTMLElement).textContent = e.response!.data.error;
                    }
                }

            }
        }

    };


    useEffect(() => {
        const fetchData: () => void = async (): Promise<void> => {
            const { data } = await get('http://127.0.0.1:8000/leaderboard/', {
                headers: {
                    'Authorization': `Bearer ${getCookie('jwt')}`
                }
            });

            setLeaderboard(data);
        };

        fetchData();
    }, []);

    return (
        <>
            {
                showAlert 
                ? (
                    <Alert 
                        message="Success"
                        type={AlertTypes.SUCCESS}
                        counter={0}
                    />
                ) : null
            }
            <div className="overlay-card follow-card">
                <div className="container">
                    <div className="card">
                        <div className="card-title">
                            <div className="title">
                                <h2></h2>
                            </div>
                            <button className='transparent' onClick={toggleOverlay}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="card-body">
                            <form id="followForm" onSubmit={submitFormHandler}>
                                <input type="checkbox" id="limit" name="limit_orders" value="true"/>
                                <label htmlFor="limit">Limit Orders</label><br />
                                <input type="checkbox" id="market" name="market_orders" value='Market'/>
                                <label htmlFor="market">Market Orders</label><br />
                                <button className="btn" type="submit">Copy</button>
                                <span className='error' id="errorMessage"></span>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container leaderboard-container">
                <div className="card flex">
                    <div className="card-title">
                        <h2>Weekly Leaderboard</h2>
                    </div>
                    <div className="card-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Username</th>
                                    <th>Earnings</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(leaderboard).map(([index, data]) => (
                                    <tr key={index}>
                                        <td data-key='rank'>{data['rank']}</td>
                                        <td data-key='username' >{data['username']}</td>
                                        <td data-key='earnings' style={{ color: "#44c809"}} >{data['earnings']}</td>
                                        <td>
                                            <button onClick={toggleOverlay} className="btn btn-secondary follow-btn">Follow</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeaderBoard;
