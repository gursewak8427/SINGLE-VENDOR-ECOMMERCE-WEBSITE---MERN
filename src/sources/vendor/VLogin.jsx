import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'
import { authenticate, getTokenAdmin } from '../../helpers/auth'

import './VLogin.css'
import { KEYS } from '../keys';

function VLogin(props) {
    const [formState, setFormState] = useState({
        phone: '',
        password: '',
    })
    const onChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value })
    }
    const onSubmit = (e) => {
        e.preventDefault();
        const data = {
            phone: formState.phone,
            password: formState.password
        };
        axios
        .post(`${KEYS.NODE_URL}/api/vendor/156/signin`, data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
        .then(result => {
            authenticate(result, () => {
                setFormState({ 
                    ...formState,
                    phone: '',
                    password: '',
                });
                props.history.push('/vendor')
            })
        })
        .catch(err => {
          alert(err.response.data.error)
          console.log("Error in Login : ", err.response.data.error);
        })

    }
    return (
        <>
            <div className="v-login">
                <div className="form">
                    <label htmlFor="">Login Here For <span>Style Factory</span></label>
                    <div className="form-field">
                        <label htmlFor="">Enter Your Number or Username</label>
                        <input type="text" name='phone' value={formState.phone} onChange={onChange} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="">Enter Password</label>
                        <input type="password" name='password' value={formState.password} onChange={onChange} />
                    </div>
                    <div className="form-field">
                        <button type='button' onClick={onSubmit}>Login</button>
                    </div>

                </div>
            </div>
        </>
    );
}

export default VLogin;
