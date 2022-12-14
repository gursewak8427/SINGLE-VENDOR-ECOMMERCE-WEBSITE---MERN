import React, { useEffect, useState } from 'react';
import { Redirect, Link, Router, Route } from 'react-router-dom'
import axios from 'axios'
import { KEYS } from '../../keys';

import './VSidebar.css'
import { getTokenAdmin } from '../../../helpers/auth';

function VSidebar() {
    const [state, setState] = useState({
        index: 1,
    })
    const [newNotify, setNewNotify] = useState(0)

    const closeSideBar = () => {
        document.getElementsByClassName('sideBar')[0].classList.remove('active')
        document.getElementsByClassName('sideToggle')[0].classList.remove('open')
    }
    const setIndex = id => {
        closeSideBar()
        setState({ ...state, index: id })
        if (id == 5) {
            // set zero Notifications
            axios.post(`${KEYS.NODE_URL}/api/vendor/order/156/setNewNotify`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `barear ${getTokenAdmin()}`
                  }
            })
            .then(result => {
                setNewNotify(result.data.newNotify)
            })
            .catch(err => {
                console.log(err.response.data.error)
            })
        }
    }

    useEffect(() => {
        axios.post(`${KEYS.NODE_URL}/api/vendor/order/156/getNewNotify`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                setNewNotify(result.data.newNotify)
            })
            .catch(err => {
                console.log(err.response.data.error)
            })
    }, [])

    useEffect(() => {
        let URL = window.location.pathname
        URL = URL.split('/')
        if (URL[2] == 'dashborad') {
            setState({ ...state, index: 1 })
        }
        if ((URL[2] == 'product')) {
            setState({ ...state, index: 2 })
        }
        if (URL[2] == 'attr') {
            setState({ ...state, index: 3 })
        }
        if (URL[2] == 'manage') {
            setState({ ...state, index: 4 })
        }
        if (URL[2] == 'orders') {
            setState({ ...state, index: 5 })
        }
        if (URL[2] == 'general') {
            setState({ ...state, index: 6 })
        }
    }, [window.location.pathname])

    return (
        <>
            <div className='aside sideBar'>
                <div className="data">
                    <div className="logo">
                        <img src="https://res.cloudinary.com/mycloud8427/image/upload/v1622750163/3_cdjew4.png" alt="" />
                    </div>
                    <Link to='/vendor/dashboard' onClick={() => setIndex(1)}>
                        <li className={state.index == 1 ? 'active' : ''}>
                            <i className="fas fa-home"></i>
                            <span>Dashboard</span>
                        </li>
                    </Link>
                    <Link to='/vendor/product' onClick={() => setIndex(2)}>
                        <li className={state.index == 2 ? 'active' : ''}>
                            <i className="fas fa-sitemap"></i>
                            <span>Product</span>
                        </li>
                    </Link>
                    <Link to='/vendor/attr' onClick={() => setIndex(3)}>
                        <li className={state.index == 3 ? 'active' : ''}>
                            <i className="fas fa-cubes"></i>
                            <span>Attribute</span>
                        </li>
                    </Link>
                    <Link to='/vendor/manage' onClick={() => setIndex(4)}>
                        <li className={state.index == 4 ? 'active' : ''}>
                            <i className="fas fa-tasks"></i>
                            <span>Management</span>
                        </li>
                    </Link>
                    <Link to='/vendor/orders' onClick={() => setIndex(5)}>
                        <li className={state.index == 5 ? 'active' : ''}>
                            <i className="fas fa-shopping-basket"> <span className={newNotify > 0 ? 'ac' : ''}>{newNotify}</span> </i>
                            <span>Orders</span>
                        </li>
                    </Link>
                    <Link to='/vendor/general/sliders' onClick={() => setIndex(6)}>
                        <li className={state.index == 6 ? 'active' : ''}>
                            <i className="fas fa-tv"></i>
                            <span>Sliders</span>
                        </li>
                    </Link>
                </div>
                <div className="tt" onClick={closeSideBar}>
                </div>
            </div>
        </>
    );
}

export default VSidebar;
