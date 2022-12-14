import React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useStateValue } from '../../../StateProvider/StateProvider';
import { removeCookie } from '../../../helpers/auth';

import './VNavbar.css'

function VNavbar() {
    const [store, dispatch] = useStateValue();
    let history = useHistory();

    const toggleSide = () => {
        document.getElementsByClassName('sideBar')[0].classList.add('active')
        document.getElementsByClassName('sideToggle')[0].classList.add('open')
    }
    const toggleProfileMenu = () => {
        document.getElementsByClassName('profileBtn')[0].classList.toggle('open')
    }
    const logoutVendor = () => {
        // signout()
        
        dispatch({
            type: 'UNSET_ADMIN',
            data: ''
        })
        removeCookie('token')
        history.push(`/vendor/login`);
    }
    const goToProfile = () => {
        history.push(`/vendor/profile`);
    }
    return (
        <>
            <nav className={`v-nav ${store.loading ? 'loading' : ''}`}>
                <div className="sideToggle" onClick={toggleSide}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className="profileBtn" onClick={toggleProfileMenu}>
                    <div className="list open">
                        <li onClick={() => goToProfile()}><i className="far fa-user"></i><span>Profile</span></li>
                        <li onClick={() => logoutVendor()}><i className="fas fa-power-off"></i><span>Logout</span></li>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default VNavbar;
