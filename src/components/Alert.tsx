import { FC, useEffect } from 'react';



export enum AlertTypes {
    SUCCESS = 'success',
    UPDATE = 'update',
    ERROR = 'error',
    NOTIFICATION = 'notification',
}


export interface AlertProps {
    message: string,
    type: AlertTypes | null,
    counter: number
}


const Alert: FC<AlertProps> = ({message, type, counter}) => {
    
    const sleep = async (ms: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const displayMessage = async (alertMessage: string) => {
        /*
            Displays the alert button with custom background
            color and message depending on type
        */
       
        const alertContainer = (document.querySelector('.alert-container') as HTMLElement);
        const alertMessageElement = (document.getElementById('alertMessage') as HTMLElement);
        
        if (type === AlertTypes.SUCCESS) { alertMessageElement.style.backgroundColor = 'green'; }
        else if (type === AlertTypes.UPDATE) { alertMessageElement.style.backgroundColor = 'purple'; }
        else if (type === AlertTypes.ERROR) { alertMessageElement.style.backgroundColor = 'red'; }

        
        alertMessageElement.textContent = alertMessage;
        alertContainer.style.display = 'flex';

        await sleep(3000);

        alertContainer.style.display = 'none';
        alertMessageElement.textContent = '';
    };

    useEffect(() => {
        displayMessage(message);
    }, [counter]);

    return (
        <div className='alert-container'>
            <div id="alertMessage"></div>
        </div>
    );
};

export default Alert;