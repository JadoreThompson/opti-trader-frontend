import { FC } from 'react';
import axios from 'axios';
import { setCookie } from 'typescript-cookie';

const Register: FC<{ switchToLogin: () => void, setIsLoggedIn: () => void }> = ({ switchToLogin, setIsLoggedIn }) => {
    
    const registerUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                "http://127.0.0.1:8000/accounts/register", 
                Object.fromEntries(new FormData(e.target as HTMLFormElement).entries())
            );

            const token = data?.token;
            if (token) {
                setCookie('jwt', token) // TODO: In production set secure: true and the same for login
                setIsLoggedIn();
            }
        } catch(e) {
            if (e.response.status === 409) {
                const errorElement = document.getElementById("errorMessage") as HTMLElement
                errorElement.textContent = e.response.data.error;
            }
        }
    };
    

    return (
        <div className="container auth-container">
            <div className="card auth-card">
                <div className="card-title">
                    <h1>Register</h1>
                </div>
                <form id='registerForm' onSubmit={registerUser}>
                    <input type="text" name='email' placeholder='Email'/>
                    <input type="text" name='password' placeholder='Password'/>
                    <button type="submit" className='btn btn-primary'>Register</button>
                </form>
                <div className="card-footer">
                    <p>Already have an account? <a href="#" onClick={(e) => {e.preventDefault(); switchToLogin();}}>Login</a></p>
                    <p style={{ color: "red" }} id="errorMessage"></p>
                </div>
            </div>
        </div>
    );
};


export default Register;
