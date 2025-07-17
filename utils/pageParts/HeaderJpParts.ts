import { useState } from 'react';

const Main = () => {
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const handleMenuOpen = () => {
        setMenuStatus((prevStatus) => !prevStatus);
        if(menuStatus === false){
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style = '';
        }
    };
    return { handleMenuOpen, menuStatus };
}

export default Main;