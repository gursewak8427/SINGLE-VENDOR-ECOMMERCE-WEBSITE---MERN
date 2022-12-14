import React, { useCallback } from 'react';
import { useStateValue } from '../../../StateProvider/StateProvider';
import { useHistory } from "react-router-dom";
import { removeCookie, signoutUser } from '../../../helpers/auth';

import './SideBar.css'

const SideBar = (props) => {
    let history = useHistory();

    const [store, dispatch] = useStateValue();

    const closeSideBar = () => {
        document.getElementById('menuBtn').classList.remove('open')
        document.getElementById('sideBar').classList.remove('open')
        document.getElementById('sideMenu').classList.remove('open')
    }
    const openSideMenu = () => {
        document.getElementById('menuBtn').classList.remove('open')
        document.getElementById('sideMenu').classList.add('open')
        document.getElementById('sideBar').classList.remove('open')
    }
    const closeSideMenu = () => {
        document.getElementById('menuBtn').classList.remove('open')
        document.getElementById('sideMenu').classList.remove('open')
        document.getElementById('sideBar').classList.remove('open')
    }

    const goToSubCat = (cat, sc) => {
        let newCat = {
            _id: cat._id,
            categoryName: cat.categoryName,
            categoryIndex: cat.categoryIndex
        }
        history.push(`/c/${JSON.stringify(newCat)}/${sc._id}`);
        document.getElementById('sideMenu').classList.remove('open')
        document.getElementById('sideBar').classList.remove('open')
    }
    const signin = () => {
        document.getElementById('signup').classList.add('open')
        document.getElementById('sideBar').classList.remove('open')
        document.getElementById('menuBtn').classList.remove('open')
    }
    const goTo = type => {
        if (type == 'c') { history.push(`/cart`) }
        if (type == 'o') { history.push(`/orders`) }
        if (type == 'p') { history.push(`/profile`) }
        closeSideBar()
    }
    const signOut = () => {
        dispatch({
            type: 'LOGOUT_USER',
            data: ''
        })
        dispatch({
            type: 'UNSET_USER',
            data: ''
        })
        removeCookie('token-client')
        history.push(`/`);
        document.getElementById('sideBar').classList.remove('open')
        document.getElementById('menuBtn').classList.remove('open')
    }
    return (
        <>
            <aside id="sideBar" className=''>
                <div className="data a">
                    <li><span><span >Hello</span> {store.user == '' ? (<span className='signin' onClick={signin}>Sign In</span>) : (<span className='navName' onClick={() => goTo('p')}>{store.user?.name}</span>)} </span></li>
                    <li onClick={openSideMenu}>Shop By Category</li>
                    <li onClick={() => goTo('o')}>Orders</li>
                    <li onClick={() => goTo('c')}>Cart</li>
                    {
                        store.user != '' ? <li onClick={signOut}>Logout</li> : null
                    }

                </div>
                <div className="clickAble" onClick={closeSideBar}>
                </div>
            </aside>

            <aside id="sideMenu" className=''>
                <div className="data">
                    <h4>Shop By Category</h4>
                    {
                        store.rawdata.length != 0 ? (
                            store.rawdata?.categories.map((cat, index) =>
                                cat.categoryStatus == 1 ?
                                    <li className='list' key={index} id={`list${index}`} onClick={() => document.getElementById(`list${index}`).classList.toggle('open')}>
                                        <label htmlFor="">{cat.categoryName}</label>
                                        <ul>
                                            {
                                                store.rawdata.subCategories.map((sc, i) =>
                                                    sc.subCategoryStatus == 1 ?
                                                        sc.subCategoryParent == cat._id ?
                                                            <li key={i} onClick={() => goToSubCat(cat, sc)}>{sc.subCategoryName}</li>
                                                            : null : null
                                                )
                                            }
                                        </ul>
                                    </li> :
                                    null
                            )
                        ) : null
                    }
                </div>
                <div className="clickAble" onClick={closeSideMenu}></div>
            </aside>

        </>
    );
}

export default SideBar