import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios'
import { useStateValue } from '../../StateProvider/StateProvider';
import { KEYS } from '../keys'
import { isAuthUser, setLocalStorage } from '../../helpers/auth'
import { ToastContainer, toast } from 'react-toastify';

import './Profile.css'

const Profile = (props) => {
    const [active, setActive] = useState(1)
    const [store, dispatch] = useStateValue();
    const [state, setState] = useState({
        profileName: '',
        profileNum: '',
        cPass: '',
        pass1: '',
        pass2: '',
    })
    useEffect(() => {
        var user = store.user
        if (user != '') {
            setState({
                ...state,
                profileName: user.name,
                profileNum: user.phone
            })
        } else {
            document.getElementById('signup').classList.add('open')
        }
    }, [])

    const onChange = e => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    const updateProfile = () => {
        let data = { userId: store.user.id, uname: state.profileName }
        axios.post(`${KEYS.NODE_URL}/api/user/auth/156/updateProfile/general`, data).then(result => {
            let user = store.user
            user.name = state.profileName
            toast.info('Update Successfully')
        }).catch(err => console.log(err))
    }

    const updatePassword = () => {
        axios.post(`${KEYS.NODE_URL}/api/user/auth/156/updateProfile/security/checkPassword`, { userId: store.user.id, password: state.cPass }).then(result => {
            if (state.pass1 == state.pass2) {
                axios.post(`${KEYS.NODE_URL}/api/user/auth/156/updateProfile/security/updatePassword`, { userId: store.user.id, password: state.pass1 }).then(result => {
                    setState({ ...state, cPass: '', pass1: '', pass2: '' })
                    toast.success('Password Updated')
                }).catch(err => console.log(err))
            } else {
                toast.error('Password Must be Same')
            }
        }).catch(err => {
            if (err?.response?.data?.error) {
                toast.error(err?.response?.data?.error)
            } else {
                console.log(err)
            }
        })
    }

    return (
        <>
            <div className="wrapper">
                <ToastContainer />
                <div className="userProfile">
                    {
                        store.user == '' ?
                            <div className="loginFirst">
                                <img src="https://borlabs.io/wp-content/uploads/2019/09/blog-wp-login.png" alt="" />
                                <span className='a'>Please Signin/ Signup</span>
                            </div>
                            : (
                                <>
                                    <div className="left sideProfileMenu">
                                        <li onClick={() => setActive(1)} className={`${active == 1 ? 'active' : ''}`}>General</li>
                                        <li onClick={() => setActive(2)} className={`${active == 2 ? 'active' : ''}`}>Security</li>
                                        {/* <li onClick={() => setActive(3)} className={`${active == 3 ? 'active' : ''}`}>Appearnace</li> */}
                                    </div>
                                    <div className="right profileManagement">
                                        <div className={`box ${active == 1 ? 'active' : ''}`}>
                                            <label>Hello, <span>{store.user.name} 😍</span></label>
                                            <div className="formProfile">
                                                <div className="form-area">
                                                    <label htmlFor="">Your Name</label>
                                                    <input type="text" value={state.profileName} name={'profileName'} onChange={onChange} />
                                                </div>
                                                <div className="form-area">
                                                    <label htmlFor="">Your Number</label>
                                                    <input type="text" value={state.profileNum} style={{background: '#c2b3b2', cursor: 'not-allowed'}} readOnly/>
                                                </div>
                                                <button className="update" onClick={updateProfile}>Update</button>
                                            </div>
                                        </div>
                                        <div className={`box ${active == 2 ? 'active' : ''}`}>
                                            <label><span>{store.user.name}</span> , Change Password Here 🙂</label>
                                            <div className="formProfile">
                                                <div className="form-area">
                                                    <label htmlFor="">Current Password</label>
                                                    <input type="password" value={state.cPass} name={'cPass'} onChange={onChange} />
                                                </div>
                                                <div className="form-area">
                                                    <label htmlFor="">New Password</label>
                                                    <input type="password" value={state.pass1} name={'pass1'} onChange={onChange} />
                                                </div>
                                                <div className="form-area">
                                                    <label htmlFor="">Confirm New Password</label>
                                                    <input type="password" value={state.pass2} name={'pass2'} onChange={onChange} />
                                                </div>
                                                <button className="update" onClick={updatePassword}>Update Password</button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                </div>
            </div>
        </>
    )
}

export default Profile;
