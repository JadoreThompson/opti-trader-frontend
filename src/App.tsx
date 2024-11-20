import { FC, useEffect, useState } from 'react';
import { getCookie } from 'typescript-cookie';

// Local
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';


const App: FC = () => {
  const [isRegistering, setIsRegistering] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (getCookie('jwt')) { setIsLoggedIn(true); }
    
    } catch(e) {
      console.error(e);
    }
  });


  /* ------------------
        Handlers
  ------------------ */
  const switchToRegister = () => { setIsRegistering(true); };
  const switchToLogin = () => { setIsRegistering(false); };
  const isRegistered = () => { setIsLoggedIn(true) };


  return (
    <>
      { isLoggedIn ? (
          <Dashboard />
        ) : isRegistering ? (
          <Register switchToLogin={switchToLogin} setIsLoggedIn={isRegistered}/>
        ) : (
          <Login switchToRegister={switchToRegister} setIsLoggedIn={isRegistered}/>
        )
      }
    </>
  );
};

export default App;