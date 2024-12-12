import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getCookie, setCookie } from 'typescript-cookie';
import axios from 'axios';

const Auth: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        if (isLoggedIn) { navigate("/dashboard/trade"); }
    }, [isLoggedIn]);

    useEffect(() => {
        if (location.pathname === "/auth/register") { setIsRegistering(true); } 
        else if (location.pathname === "/auth/login") { setIsRegistering(false); }
    }, [location.pathname]);

    const handleSubmit: (arg: React.FormEvent<HTMLFormElement>) => void = async (e: React.FormEvent<HTMLFormElement>): Promise<void> =>  {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target as HTMLFormElement));
        const header: Record<string, Record<string, string>> = { headers: { 'Authorization': `Bearer ${getCookie('jwt')}` }};
        const url: string = isRegistering ? 'http://127.0.0.1:8000/accounts/register' : 'http://127.0.0.1:8000/accounts/login';
        
        try
        {
            const { data } = await axios.post(
                url,
                formData,
                header
            );
            
            setCookie('jwt', data?.token);
            setIsLoggedIn(true);
        } catch(e)
        {
            console.error(e);
        }

    };

    return (
        <>
            {isRegistering
                ? (
                    <>
                    <div className="container auth-container">
                        <div className="card auth-card">
                            <div className="card-title">
                                <h1>Register</h1>
                            </div>
                            <form id='registerForm' onSubmit={handleSubmit}>
                                <input type="text" name="username" placeholder='Username'/>
                                <input type="text" name='email' placeholder='Email'/>
                                <input type="text" name='password' placeholder='Password'/>
                                <button type="submit" className='btn btn-primary'>Register</button>
                            </form>
                            <div className="card-footer">
                                <p>Already have an account? <Link to="/auth/login" replace={true}>login</Link></p>
                                <p style={{ color: "red" }} id="errorMessage"></p>
                            </div>
                        </div>
                    </div>
                    </>
                ) : (
                    <>
                        <div className="container auth-container">
                            <div className="card auth-card">
                                <div className="card-title">
                                    <h1>Login</h1>
                                </div>
                               <form id='loginForm' onSubmit={handleSubmit}>
                                    <input type="text" name='email' placeholder='Email' required/>
                                    <input type="text" name='password' placeholder='Password' required/>
                                    <button className='btn btn-primary'>Login</button>
                                </form>
                                <div className="card-footer">
                                    <p>Don't have an account? <Link to="/auth/register" replace={true}>Register</Link></p>
                                    <p style={{ color: "red", textAlign: 'center' }} id="errorMessage"></p>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </>
    )
};

export default Auth;