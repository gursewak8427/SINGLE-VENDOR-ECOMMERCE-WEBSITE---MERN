import React, { useState } from 'react'
import axios from 'axios'
import './Signup.css'
import { authenticateUser } from '../../../helpers/auth'
import { useStateValue } from '../../../StateProvider/StateProvider';

import firebase from "../firebase/firebase-config.js";
import { KEYS } from '../../keys';
import { toast, ToastContainer } from 'react-toastify';

const Signup = (props) => {
    const [store, dispatch] = useStateValue();

    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    const [loginNum, setLoginNum] = useState('');
    const [loginPass, setLoginPass] = useState('');

    const [fnumber, setFNumber] = useState('');
    const [fcode, setFCode] = useState('');
    const [fpass1, setFPass1] = useState('');
    const [fpass2, setFPass2] = useState('');
    const [countNotify, setCountNotify] = useState(1)
    const [captcha, setCaptcha] = useState(false);


    // login
    const setUpRecaptcha = () => {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'normal',
            'callback': (response) => {
            },
            'expired-callback': () => {
                // Response expired. Ask user to solve reCAPTCHA again.
                // ...
            }
        });
    };

    // forgot
    const setUpRecaptcha_b = () => {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-b', {
            'size': 'normal',
            'callback': (response) => {
            },
            'expired-callback': () => {
                // Response expired. Ask user to solve reCAPTCHA again.
                // ...
            }
        });
    };


    const onSignInSubmit = (e) => {
        // check number
        axios.post(`${KEYS.NODE_URL}/api/user/auth/156/userCheck`, { number })
            .then(result => {
                var ii = document.getElementsByClassName('r1')
                for (let i = 0; i < ii.length; i++) {
                    ii[i].style.display = "none"
                }
                setUpRecaptcha();
                setCaptcha(true)
                var phoneNumber = "+91" + number;
                let appVerifier = window.recaptchaVerifier
                firebase
                    .auth()
                    .signInWithPhoneNumber(phoneNumber, appVerifier)
                    .then(function (confirmationResult) {
                        window.confirmationResult = confirmationResult;
                        window.recaptchaVerifier.clear()
                        setCaptcha(false)
                        var ii = document.getElementsByClassName('r1')
                        for (let i = 0; i < ii.length; i++) {
                            ii[i].style.display = "block"
                        }
                        toast.info('OTP send to ' + number)
                        toggleFields()
                    })
                    .catch(function (error) {
                        var ii = document.getElementsByClassName('r1')
                        for (let i = 0; i < ii.length; i++) {
                            ii[i].style.display = "block"
                        }
                        window.recaptchaVerifier.clear()
                        setCaptcha(false)
                        console.log(error);
                        toast.error('Something Went Wrong')
                    });
            })
            .catch(err => {
                if (err?.response?.data?.error) {
                    toast.error(err?.response?.data?.error)
                } else {
                    console.log(err)
                }
            })


    };
    // login end

    // forget
    const onForgetSubmit = (e) => {
        var ii = document.getElementsByClassName('r1')
        for (let i = 0; i < ii.length; i++) {
            ii[i].style.display = "none"
        }
        setUpRecaptcha_b();
        setCaptcha(true)
        var phoneNumber = "+91" + fnumber;
        let appVerifier = window.recaptchaVerifier
        firebase
            .auth()
            .signInWithPhoneNumber(phoneNumber, appVerifier)
            .then(function (confirmationResult) {
                window.confirmationResult = confirmationResult;
                window.recaptchaVerifier.clear()
                setCaptcha(false)
                var ii = document.getElementsByClassName('r1')
                for (let i = 0; i < ii.length; i++) {
                    ii[i].style.display = "block"
                }
                toast.info('OTP send to ' + fnumber)
                toggleFieldsForgotB()
            })
            .catch(function (error) {
                var ii = document.getElementsByClassName('r1')
                for (let i = 0; i < ii.length; i++) {
                    ii[i].style.display = "block"
                }
                window.recaptchaVerifier.clear()
                setCaptcha(false)
                console.log(error);
                toast.error('Something Went Wrong')
            });
    };


    // toggle number and otp fileds
    const toggleFields = () => {
        document.getElementById('numberField').classList.toggle('closeField')
        document.getElementById('codeField').classList.toggle('openField')
    }
    const toggleFieldsForgot = () => {
        document.getElementById('forgotField').classList.add('open');
        document.getElementById('codeFieldForgot').classList.remove('open');
    }
    const toggleFieldsForgotB = () => {
        document.getElementById('forgotField').classList.remove('open');
        document.getElementById('codeFieldForgot').classList.add('open');
    }
    const sendCode = () => {
        if (number == '') {
            alert('Number is Required');
        } else {
            onSignInSubmit();
            // ===
        }
    }
    const verifyCode = () => {
        if (code == '') {
            alert('Code Required....')
        } else {
            let otpInput = code;
            let optConfirm = window.confirmationResult;
            optConfirm
                .confirm(otpInput)
                .then(function (result) {
                    document.getElementById('codeField').classList.toggle('closeField')
                    document.getElementById('passwordField').classList.toggle('openField')
                })
                .catch(function (error) {
                    console.log(error);
                    toast.error('Invalid OTP')
                });

        }
    }

    const closeRegister = () => {
        document.getElementById('signup').classList.remove('open')
        // reset fields
        document.getElementById('numberField').classList.remove('closeField')
        document.getElementById('codeField').classList.remove('openField')
        document.getElementById('codeField').classList.remove('closeField')
        document.getElementById('passwordField').classList.remove('openField')
        // and set number to empty
        setNumber('')
        setCode('')
        setPass1('')
        setPass2('')

    }
    const closeLogin = () => {
        document.getElementById('loginField').classList.remove('close');
        document.getElementById('forgotField').classList.remove('open');

        document.getElementById('passwordFieldForgot').classList.remove('open');
        document.getElementById('codeFieldForgot').classList.remove('open');

        document.getElementById('login').classList.remove('open');

        setFNumber('')
        setFCode('')
        setFPass1('')
        setFPass2('')
    }
    const close = () => {
        var ii = document.getElementsByClassName('r1')
        for (let i = 0; i < ii.length; i++) {
            ii[i].style.display = "block"
        }
        if (captcha) {
            window.recaptchaVerifier.clear()
            setCaptcha(false)
        }
        closeLogin();
        closeRegister();
    }
    const setPassword = () => {
        let data = { name, number, password: pass1 }
        document.getElementById('shortLoading').style.display = 'block'
        axios.post(`${KEYS.NODE_URL}/api/user/auth/156/userSignup`, data)
            .then(result => {
                authenticateUser(result, () => {
                    setName('')
                    setNumber('')
                    setPass1('')
                    setPass2('')
                })
                toast.success(name + ', Registeration Complete')
                document.getElementById('shortLoading').style.display = 'none'
                // close signup form
                close();
            })
            .catch(err => {
                if (err?.response?.data?.error) {
                    toast.error(err?.response?.data?.error)
                } else {
                    console.log(err)
                }
                document.getElementById('shortLoading').style.display = 'none'
            })

    }
    const openLoginBox = () => {
        var ii = document.getElementsByClassName('r1')
        for (let i = 0; i < ii.length; i++) {
            ii[i].style.display = "block"
        }
        if (captcha) {
            window.recaptchaVerifier.clear()
            setCaptcha(false)
        }
        closeRegister();
        document.getElementById('login').classList.add('open');
        document.getElementById('loginField').classList.remove('close');
        document.getElementById('forgotField').classList.remove('open');
    }
    const openReigsterBox = () => {
        closeLogin();
        document.getElementById('signup').classList.add('open')
    }
    const openForgotBox = () => {
        var ii = document.getElementsByClassName('r1')
        for (let i = 0; i < ii.length; i++) {
            ii[i].style.display = "block"
        }
        document.getElementById('loginField').classList.add('close');
        document.getElementById('forgotField').classList.add('open');
    }
    const openCodeForgot = () => {
        onForgetSubmit();
    }
    const verifyCodeForgot = () => {
        // now time
        if (fcode == '') {
            alert('Code Required....')
        } else {
            let otpInput = fcode;
            let optConfirm = window.confirmationResult;
            optConfirm
                .confirm(otpInput)
                .then(function (result) {
                    document.getElementById('codeFieldForgot').classList.remove('open');
                    document.getElementById('passwordFieldForgot').classList.add('open');
                })
                .catch(function (error) {
                    console.log(error);
                    toast.error('Invalid OTP')
                });

        }
    }
    const setNewPassword = () => {
        if (fpass1 != fpass2) {
            toast.error('Passwords must be same')
            return
        }
        document.getElementById('shortLoading').style.display = 'block'
        let data = { number: fnumber, newPassword: fpass1 }
        axios.post(`${KEYS.NODE_URL}/api/user/auth/156/userForget`, data)
            .then(result => {
                document.getElementById('shortLoading').style.display = 'none'
                toast.success('Password Changed Successfully, Now Login')
                close()
                openLoginBox()
            })
            .catch(err => {
                if (err?.response?.data?.error) {
                    toast.error(err?.response?.data?.error)
                } else {
                    console.log(err)
                }
                document.getElementById('shortLoading').style.display = 'none'
            })
    }
    const cartBtnAnimation = () => {
        // animation on cartBoxBtn
        document.getElementsByClassName('cartBox')[0].classList.add('animate')

        setTimeout(function () {
            document.getElementsByClassName('cartBox')[0].classList.remove('animate')
        }, 2000);
        // ===================
    }
    const now_login = () => {
        let data = {
            phone: loginNum,
            password: loginPass,
        }
        document.getElementById('shortLoading').style.display = 'block'
        axios.post(`${KEYS.NODE_URL}/api/user/auth/156/userSignin`, data).then(result => {
            toast.success('Login Successfully')
            authenticateUser(result, () => {
                setLoginNum('')
                setLoginPass('')
            })
            dispatch({ type: 'SET_USER', data: result.data.user })
            axios.post(`${KEYS.NODE_URL}/api/user/cart/156/get`, { userId: result.data.user.id }).then(results => {
                dispatch({ type: 'SET_CART', items: results.data.cart })
                if (store.cart_pending != '') {
                    var item = store.cart_pending
                    let stat = true
                    results.data.cart.map(i => i.id == item.item.id ? stat = false : null)
                    console.log('stat', stat)
                    if (!stat) {
                        toast.error('Item Already in Cart')
                        document.getElementById('shortLoading').style.display = 'none'
                        return
                    }
                    item.userId = result.data.user.id
                    axios.post(`${KEYS.NODE_URL}/api/user/cart/156/add`, item).then(result => {
                        dispatch({ type: 'ADD_TO_CART', item })
                        toast.info('Added To Cart')
                        cartBtnAnimation()
                    }).catch(err => toast.error('Something Wrong'))
                }

                // get New Notifications
                axios.post(`${KEYS.NODE_URL}/api/user/order/156/getNewNotify`, { userId: result.data.user.id })
                    .then(result => {
                        dispatch({
                            type: 'SET_NEWNOTIFY',
                            number: result.data.newNotify
                        })
                    })
                    .catch(err => {
                        console.log(err)
                    })

                // notify
                axios.post(`${KEYS.NODE_URL}/api/user/order/156/getNotify`, { userId: result.data.user.id, count: countNotify })
                    .then(result => {
                        if (result.data.notify.length == 0) {
                        } else {
                            let a = store.notifyList
                            a = a.concat(result.data.notify)
                            dispatch({
                                type: 'SET_NOTIFY',
                                notifyList: a
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err.response.data.error)
                    })
                // order
                axios.post(`${KEYS.NODE_URL}/api/user/order/156/get`, { userId: result.data.user.id }).then(resultsss => {
                    document.getElementById('shortLoading').style.display = 'none'
                    dispatch({ type: 'SET_ORDERS', orders: resultsss.data.orders })
                }).catch(err => console.log(err.response.data.error))
            }).catch(err => console.log(err))

            // close signup form
            close();
        }).catch(err => {
            document.getElementById('shortLoading').style.display = 'none'
            if (err?.response?.data?.error) {
                toast.error(err?.response?.data?.error)
            } else {
                console.log(err)
            }
        })
    }
    return (
        <>
            <div className="signup" id="signup">
                <div className="crose" onClick={close}>X</div>
                <div id="numberField">
                    <label htmlFor="" className='main'>Register For <b> <span>S</span>tyle <span>F</span>actory</b></label>
                    <div className="form-field">
                        <label htmlFor="">Enter Your Number</label>
                        <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} />
                    </div>
                    <div id="recaptcha-container"></div>
                    <div className="form-field">
                        <button type="button" className={`r1`} onClick={sendCode}>Send OTP</button>
                    </div>
                    <span className='main'>
                        Already a Member? <span onClick={openLoginBox}>Login Here</span>
                    </span>
                </div>

                <div id="codeField">
                    <label htmlFor="">One Time Password(OTP) Verification <span>{number}<span onClick={toggleFields}> change number?</span></span> </label>
                    <div className="form-field">
                        <label htmlFor="">Enter OTP</label>
                        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <button type="button" onClick={verifyCode}>Verify OTP</button>
                    </div>
                </div>

                <div id="passwordField">
                    <label htmlFor="">Set Password</label>
                    <div className="form-field">
                        <label htmlFor="">Enter username</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="">Enter Password</label>
                        <input type="password" value={pass1} onChange={(e) => setPass1(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="">Enter Confirm Password</label>
                        <input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <button type="button" onClick={setPassword} >Set</button>
                    </div>
                </div>

            </div>
            <div className="login" id="login">
                <div className="crose" onClick={close}>X<i className="fa fa-crose"></i></div>

                <div id="loginField">
                    <label htmlFor="" className='main'>Login For <b> <span>S</span>tyle <span>F</span>actory</b></label>
                    <div className="form-field">
                        <label htmlFor="">Enter Your Number</label>
                        <input type="text" value={loginNum} onChange={(e) => setLoginNum(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="">Enter Your Password</label>
                        <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <span className='ff' onClick={openForgotBox}>Forgot password</span>
                        <button type="button" onClick={now_login}>Login</button>
                    </div>
                    <span className='main ll'>
                        <br />
                        Not an Member? <span onClick={openReigsterBox}>Register Here</span>
                    </span>
                </div>

                <div id="forgotField">
                    <label htmlFor="" className='main'>Forgot Password</label>
                    <div className="form-field">
                        <label htmlFor="">Enter Your Number</label>
                        <input type="text" value={fnumber} onChange={(e) => setFNumber(e.target.value)} />
                    </div>
                    <div id="recaptcha-container-b"></div>
                    <div className="form-field">
                        <button type="button" className={`r1`} onClick={openCodeForgot}>Send Code</button>
                    </div>
                    <span className='main'>
                        Not want to forgot?<span onClick={openLoginBox}> Login Here</span>
                    </span>
                </div>

                <div id="codeFieldForgot">
                    <label htmlFor="">To Forgot, One Time Password(OTP) Verification <span>{fnumber}<span onClick={toggleFieldsForgot}> change number?</span></span> </label>
                    <div className="form-field">
                        <label htmlFor="">Enter OTP</label>
                        <input type="text" value={fcode} onChange={(e) => setFCode(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <button type="button" onClick={verifyCodeForgot}>Verify OTP</button>
                    </div>
                </div>

                <div id="passwordFieldForgot">
                    <label htmlFor="">Set New Password</label>
                    <div className="form-field">
                        <label htmlFor="">Enter New Password</label>
                        <input type="password" value={fpass1} onChange={(e) => setFPass1(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="">Enter Confirm Password</label>
                        <input type="password" value={fpass2} onChange={(e) => setFPass2(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <button type="button" onClick={setNewPassword} >Set</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Signup;
