import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import { KEYS } from '../../keys'
import './NavBar.css'
import { removeCookie } from '../../../helpers/auth';
import { useStateValue } from '../../../StateProvider/StateProvider';
import axios from 'axios'


const NavBar = (props) => {
    const [store, dispatch] = useStateValue();
    const [searchItem, setSearchItem] = useState('')
    const [a, setA] = useState(false)

    const [countNotify, setCountNotify] = useState(1)
    const [emptyNotify, setEmptyNotify] = useState(false)
    const [notifyLoading, setNotifyLoading] = useState(false)

    let history = useHistory()

    useEffect(() => {
        let user = store.user
        if (user == '' || !user) {
            return
        }
        // get Notifications
        axios.post(`${KEYS.NODE_URL}/api/user/order/156/getNewNotify`, { userId: user.id })
            .then(result => {
                dispatch({
                    type: 'SET_NEWNOTIFY',
                    number: result.data.newNotify
                })
            })
            .catch(err => {
                console.log(err.response.data.error)
            })
    }, [])

    useEffect(() => {
        let user = store.user
        if (user == '') {
            return
        }
        setNotifyLoading(true)
        axios.post(`${KEYS.NODE_URL}/api/user/order/156/getNotify`, { userId: user.id, count: countNotify })
            .then(result => {
                if (result.data.notify.length == 0) {
                    setEmptyNotify(true)
                } else {
                    let a = store.notifyList
                    a = a.concat(result.data.notify)
                    dispatch({
                        type: 'SET_NOTIFY',
                        notifyList: a
                    })
                }
                setNotifyLoading(false)
            })
            .catch(err => {
                console.log(err.response.data.error)
            })

    }, [countNotify])


    useEffect(() => {
        let user = store.user
        if (user != '') {
            axios.post(`${KEYS.NODE_URL}/api/user/cart/156/get`, { userId: user.id })
                .then(result => {
                    dispatch({
                        type: 'SET_CART',
                        items: result.data.cart
                    })
                })
                .catch(err => {
                    console.log(err.response.data.error)
                })
        }
        if (store.rawdata.length == 0) {
            axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getRawData`)
                .then(result => {
                    sorting(result.data.myRawData.categories, result.data.myRawData.subCategories)
                }).catch(err => console.log(err))
        }
    }, [])


    function sorting(catList, subCatList) {
        for (let j = 0; j < catList.length; j += 1) {
            for (let i = 0; i < catList.length - j; i += 1) {
                if (catList[i + 1]) {
                    if (catList[i].categoryIndex > catList[i + 1].categoryIndex) { swapingCat(i, i + 1) }
                }
            }
        }
        function swapingCat(a, b) {
            let Temp = catList[a]
            catList[a] = catList[b]
            catList[b] = Temp
        }
        for (let j = 0; j < subCatList.length; j += 1) {
            for (let i = 0; i < subCatList.length - j; i += 1) {
                if (subCatList[i + 1]) {
                    if (subCatList[i].subCategoryIndex > subCatList[i + 1].subCategoryIndex) { swapingSubCat(i, i + 1) }
                }
            }
        }
        function swapingSubCat(a, b) {
            let Temp = subCatList[a]
            subCatList[a] = subCatList[b]
            subCatList[b] = Temp
        }
        dispatch({
            type: 'ADD_TO_RAWDATA',
            data: {
                categories: catList,
                subCategories: subCatList
            }
        })
    }


    const toggleSideBar = () => {
        document.getElementById('menuBtn').classList.toggle('open')
        document.getElementById('sideBar').classList.toggle('open')
        document.getElementById('sideMenu').classList.remove('open')
    }
    const openSideMenu = () => {
        document.getElementById('sideMenu').classList.toggle('open')
        document.getElementById('sideBar').classList.remove('open')
    }
    const signin = () => {
        document.getElementById('signup').classList.add('open')
    }
    const goToCat = cat => {
        let newCat = {
            _id: cat._id,
            categoryName: cat.categoryName,
            categoryIndex: cat.categoryIndex
        }
        history.push(`/c/${JSON.stringify(newCat)}/-1`);
    }
    const signOut = () => {
        dispatch({
            type: 'SET_NOTIFY',
            notifyList: []
        })
        dispatch({
            type: 'SET_NEWNOTIFY',
            number: 0
        })

        dispatch({
            type: 'UNSET_USER',
            data: ''
        })
        removeCookie('token-client')
        history.push(`/`);
    }
    const goToProfile = () => {
        history.push(`/profile`);
    }

    // search 
    const openSearchBox = () => {
        a == true ? setA(false) : setA(true)
        document.getElementsByClassName('searchBox')[0].classList.toggle('show')
    }
    const searchNow = () => {
        history.push(`/search/${searchItem}`)
        openSearchBox()
    }
    const openNotifyBox = () => {
        document.getElementsByClassName('notifyBox')[0].classList.add('active')
        document.getElementsByClassName('notifyBtn')[0].classList.add('show')
    }
    const closeNotifyBox = () => {
        let user = store.user
        if (user != '') {
            // set zero Notifications
            axios.post(`${KEYS.NODE_URL}/api/user/order/156/setNewNotify`, { userId: user.id })
                .then(result => {
                    dispatch({
                        type: 'SET_NEWNOTIFY',
                        number: result.data.newNotify
                    })
                })
                .catch(err => {
                    console.log(err.response.data.error)
                })
        }
        document.getElementsByClassName('notifyBox')[0].classList.remove('active')
        document.getElementsByClassName('notifyBtn')[0].classList.remove('show')
    }
    const loadMoreNotify = () => {
        if (!emptyNotify) {
            setCountNotify(countNotify + 1)
        }
    }
    const goToo = () => {
        closeNotifyBox()
        history.push('/orders')
    }
    return (
        <>
            <div className="top" id="top">
                <nav className={`ab ${store.loading ? 'loading' : ''}  ${store.navLoading ? 'loading' : ''}`}>
                    <div onClick={toggleSideBar} id="menuBtn" className="menuBtn">
                        <span></span><span></span><span></span>
                    </div>
                    <div className="mainLogoBox">
                        <Link className='links' to='/'>
                            <img alt='Style Factory' src={`https://res.cloudinary.com/mycloud8427/image/upload/v1668004711/stylefactory_vyixnm.png`} />
                        </Link>
                    </div>
                    <i className={`fa fa-${a ? 'times' : 'search'} mobSearch`} onClick={openSearchBox} />
                    <div className="proFileBtn" onClick={goToProfile}>
                        <img src='https://www.seekpng.com/png/full/138-1388103_user-login-icon-login.png' />
                    </div>
                    <div className="searchBox a">
                        {/* <div className='category'>
                            Category
                            <div className='categoryList'>
                                <li>Fruits1</li>
                                <li>Fruits2</li>
                                <li>Fruits3</li>
                            </div>
                        </div> */}
                        <input type="text" name="" value={searchItem} onChange={(e) => setSearchItem(e.target.value)} id="mainSearchField" />
                        <i className="fa fa-search" aria-hidden="true" onClick={searchNow} />
                    </div>
                    <div className="accountBox a">
                        <span><span >Hello</span> {store.user == '' && !store.user ? (<span className='signin' onClick={signin}>Sign In</span>) : (<span className='navName a'>{store.user?.name}<div id='accountDropDown'> <li onClick={goToProfile}>Profile</li> <li onClick={signOut}>Logout</li> </div></span>)} </span>
                    </div>
                    <Link className='links a' to='/orders'>
                        <div className="orderBox">
                            <i className="fa fa-bags-shopping" aria-hidden="true" />
                            <span>Returns</span>
                            <span>& Orders</span>
                        </div>
                    </Link>
                    <div className={`notifyBtn ${store.newNotify > 0 ? 'active' : ''}`}>
                        <i className="far fa-bell" onClick={openNotifyBox}></i>
                        <span onClick={openNotifyBox}>{store.newNotify > 9 ? <span>9+</span> : store.newNotify}</span>
                        <div className="notifyBox">
                            <div className="closeNotify" onClick={closeNotifyBox}>Close</div>
                            {
                                store.notifyList.length == 0 ? <i>You havn't any Notification</i> :
                                    store.notifyList.map((notify, index) => <li key={index} onClick={goToo} className={`${index < store.newNotify ? 'new' : ''}`}>{index + 1}) {notify}</li>)
                            }
                            {
                                notifyLoading ? <div className="loadmore">Loading...</div> :
                                    emptyNotify ?
                                        <div className="loadmore">No More</div> :
                                        <div className="loadmore" onClick={loadMoreNotify}>More ▼</div>
                            }
                        </div>
                    </div>
                    <Link className='links a' to='/cart'>
                        <div className="cartBox">
                            <span>{store.cart.length}</span>
                            <i className="fa fa-shopping-cart" aria-hidden="true" />
                        </div>
                    </Link>
                </nav>
                <div className="toolBar">
                    <span onClick={openSideMenu}>
                        <span className='all'>
                            All
                        </span>
                    </span>
                    {
                        store.rawdata?.categories?.map((cat, index) =>
                            cat.categoryStatus == 1 ?
                                index < 5 ?
                                    <span key={index}>
                                        <span onClick={() => goToCat(cat)}>
                                            {cat.categoryName}
                                        </span>
                                    </span>
                                    : null : null
                        )
                    }
                </div>
            </div>
        </>
    );
}

export default NavBar;