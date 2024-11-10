import { FC, useEffect } from 'react';
import axios from 'axios';
import { setCookie } from 'typescript-cookie';


const Login: FC<{ switchToRegister: () => void, setIsLoggedIn: () => void }> = ({ switchToRegister, setIsLoggedIn }) => {
    
    const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                "http://127.0.0.1:8000/accounts/login", 
                Object.fromEntries(new FormData(e.target).entries())
            );
            
            const token = data?.token;
            if (token) {
                setCookie('jwt', token); // TODO: In production set secure: true and the same for register
                setIsLoggedIn();
            }
        } catch(e) {
            console.error(e);
        }
    };
    
    return (
        <div className="container auth-container">
            <div className="card auth-card">
                <div className="card-title">
                    <h1>Login</h1>
                </div>
                <form id='loginForm' onSubmit={loginUser}>
                    <input type="text" name='email' placeholder='Email' required/>
                    <input type="text" name='password' placeholder='Password' required/>
                    <button className='btn btn-primary'>Login</button>
                </form>
                <div className="card-footer">
                    <p>Don't have an account? <a href="" onClick={switchToRegister}>Register</a></p>
                </div>
            </div>
        </div>
    );
};


export default Login;
