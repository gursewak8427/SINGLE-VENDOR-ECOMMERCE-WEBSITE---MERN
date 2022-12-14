import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'
import { getTokenAdmin } from '../../helpers/auth'

import './VProfile.css'
import { KEYS } from '../keys';
import { set } from 'js-cookie';

function VProfile() {
    const [state, setState] = useState({
        name: '',
        uname: '',
        phone: '',
        currentPass: '',
        newPass: '',
        confirmPass: '',
        cod: false
    })
    useEffect(() => {
        axios
            .post(`${KEYS.NODE_URL}/api/vendor/156/getVendor`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `barear ${getTokenAdmin()}`
                  }
            })
            .then(result => {
                console.log(result)
                setState({
                    ...state,
                    name: result.data.name,
                    uname: result.data.name,
                    phone: result.data.phone,
                    cod: result.data.cod,
                })
            }).catch(err => console.log(err))
    }, [])
    const onChange = e => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    const updateName = () => {
        axios.post(`${KEYS.NODE_URL}/api/vendor/156/update/name`, { name: state.name },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                setState({
                    ...state,
                    uname: state.name
                })
            })
    }
    const updateNumber = () => {
        axios.post(`${KEYS.NODE_URL}/api/vendor/156/update/number`, { number: state.phone },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => alert('saved'))
    }
    const toggleCOD = () => {
        axios.post(`${KEYS.NODE_URL}/api/vendor/156/toggleCOD`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                console.log(result)
                setState({
                    ...state,
                    cod: result.data.cod
                })
            }
            )
    }
    const updatePassword = () => {
        axios.post(`${KEYS.NODE_URL}/api/vendor/156/checkPassword`, { password: state.currentPass },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        }).then(result => {
            if (state.newPass == state.confirmPass) {
                axios.post(`${KEYS.NODE_URL}/api/vendor/156/updatePassword`, { password: state.newPass },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `barear ${getTokenAdmin()}`
                      }
                }).then(result => {
                    setState({ ...state, currentPass: '', newPass: '', confirmPass: '' })
                    alert('Password Updated')
                    // toast.success('Password Updated')
                }).catch(err => console.log(err))
            } else {
                alert('Password must be same')
                // toast.error('Password Must be Same')
            }
        }).catch(err => {
            if (err?.response?.data?.error) {
                alert(err?.response?.data?.error)
                // toast.error(err?.response?.data?.error)
            } else {
                console.log(err)
            }
        })
    }
    return (
        <>
            <div className="v-wrapper">
                <div className="design"></div>
                <div className="v-product">
                    <div className="mainLabelName">Hello, {state.uname}</div>
                    <div className="form profile">
                        <div className="form-field vender vender">
                            <label htmlFor="">Name</label>
                            <input type="text" name="name" value={state.name} onChange={onChange} />
                        </div>
                        <div className="form-field vender">
                            <button onClick={updateName}>Update</button>
                        </div>
                        <div className="form-field vender">
                            <label htmlFor="">Change Number</label>
                            <input type="text" name="phone" value={state.phone} onChange={onChange} />
                        </div>
                        <div className="form-field vender">
                            <button onClick={updateNumber}>Update</button>
                        </div>
                        <div className="password-change">
                            <label htmlFor="">Change Password</label>
                            <div className="form-field vender">
                                <label htmlFor="">Current Passowrd</label>
                                <input type="text" name='currentPass' value={state.currentPass} onChange={onChange} />
                            </div>
                            <div className="form-field vender">
                                <label htmlFor="">New Password</label>
                                <input type="text" name='newPass' value={state.newPass} onChange={onChange} />
                            </div>
                            <div className="form-field vender">
                                <label htmlFor="">Confirm Password</label>
                                <input type="text" name='confirmPass' value={state.confirmPass} onChange={onChange} />
                            </div>
                            <div className="form-field vender">
                                <button onClick={updatePassword}>Change Password</button>
                            </div>
                        </div>
                        <div className="cod-option">
                            <label htmlFor="">Cash on delivery</label>
                            {
                                state.cod ? <button className='d' onClick={toggleCOD}>Deactive</button> :
                                    <button className='a' onClick={toggleCOD}>Active</button>
                            }

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VProfile;
