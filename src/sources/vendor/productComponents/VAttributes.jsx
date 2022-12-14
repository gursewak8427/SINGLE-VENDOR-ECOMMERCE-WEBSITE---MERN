import React, { useEffect, useState } from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'

import { getTokenAdmin } from '../../../helpers/auth';
import './VAttributes.css'
import { KEYS } from '../../keys';
import { useStateValue } from '../../../StateProvider/StateProvider';

function VAttributes() {
    const [store, dispatch] = useStateValue();
    const [state, setState] = useState({
        attributes: [],
        attr: '',
        val: '',
        updatedAttrId: undefined,
        newPushVal: '',
        error: []
    })
    useEffect(() => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getAttribute`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                setState({ ...state, attributes: result.data.myAttributes })
            }).catch(err => {
                console.log(err)
            })
    }, [])
    const onSubmit = () => {
        if(state.attr == '' || state.val == ''){
            alert('All fields are required')
            return
        }
        dispatch({
            type: 'SET_LOADING'
        })
        let newAttr = {
            attribute: state.attr,
            values: state.val
        }
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/insertAttribute`, newAttr,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                setState({ ...state, attr: '', val: '', attributes: result.data.myAttributes })
            }).catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log(err)
            })
    }
    const removeAttr = id => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/deleteAttribute`, { id },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                if (result.data?.error) {
                    state.error = []
                    result.data?.error.map(obj => {
                        state.error.push(obj)
                    })
                    setState({ ...state, error: state.error })
                } else {
                    setState({ ...state, attributes: result.data.myAttributes })
                }
                dispatch({
                    type: 'UNSET_LOADING'
                })      
            }).catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log('err', err)
            })
    }
    const onChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    const pushNew = id => {
        setState({
            ...state,
            updatedAttrId: id,
            newPushVal: ''
        })
        document.getElementsByClassName('newPush')[0].classList.add('active')
    }
    const closeNewPush = () => {
        setState({
            ...state,
            updatedAttrId: undefined,
            newPushVal: ''
        })
        document.getElementsByClassName('newPush')[0].classList.remove('active')
    }
    const addNewPush = () => {
        dispatch({
            type: 'SET_LOADING'
        })
        let data = {
            id: state.updatedAttrId,
            value: state.newPushVal
        }
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/pushNewAttribute`, data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                if (result.data.myAttributes == 0) {
                    alert('value is already present')
                } else {
                    setState({ ...state, attributes: result.data.myAttributes, updatedAttrId: undefined, newPushVal: '' })
                    document.getElementsByClassName('newPush')[0].classList.remove('active')
                }
                dispatch({
                    type: 'UNSET_LOADING'
                })
            }).catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log('err', err)
            })
    }
    const deleteThisAttrValue = (id, index) => {
        dispatch({
            type: 'UNSET_LOADING'
        })
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/getAttributeWithId`, { id },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                let myAtr = result.data.myAttribute
                if (myAtr.numProduct[index].length == 0) {
                    myAtr.values.splice(index, 1)
                    myAtr.numProduct.splice(index, 1)
                    axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/setAttributes`, { id, attribute: myAtr },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `barear ${getTokenAdmin()}`
                          }
                    })
                        .then(results => {
                            setState({ ...state, attributes: results.data.myAttribute })
                        }).catch(err => {
                            console.log(err)
                        })
                } else {
                    alert('This Value is used in product. If you want to delete first delete those product varient')
                }
                dispatch({
                    type: 'UNSET_LOADING'
                })
            }).catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log(err)
            })
    }
    const closeErrorDiv = () => {
        setState({
            ...state,
            error: []
        })
    }

    return (
        <>
            <div className="v-wrapper">
                <div className="design"></div>
                <div className="v-product">
                    <h1 className="label">Attributes / Variation-types</h1>
                    <div className="attribute-content">
                        <div className="left">
                            <div className="form-area">
                                <label htmlFor="">New Attribute</label>
                                <input type="text" name="attr" value={state.attr} onChange={onChange} placeholder="For example : colors" />
                            </div>
                            <div className="form-area">
                                <label htmlFor="">Values</label>
                                <input type="text" name="val" value={state.val} onChange={onChange} placeholder="value1, value2, value3 etc..." />
                            </div>
                            <div className="form-area">
                                <button onClick={onSubmit} id="attrAddBtn">Add</button>
                            </div>
                        </div>
                        <div className="right">
                            {
                                state.error.length != 0 ? (
                                    <div className="divError">
                                        <span className='crs' onClick={closeErrorDiv}>X</span>
                                        {
                                            state.error.map((error, index) => (
                                                    <span key={index}>
                                                        <b>Error:</b> "{error[0]}" is used in Product Id's : {error[1].map((err, index) => index < 1 ? <span>{err},</span> : index == 1 ? 'etc..' : null)}
                                                        <br/>
                                                        <i>First Delete These Products or Varient</i>
                                                    </span>
                                            )
                                            )
                                        }
                                    </div>
                                ) : null
                            }
                            {
                                (state.attributes).map((obj, index) => (
                                    <div key={index} className="attr-list">
                                        <span className='first'>
                                            <span>{obj.attribute}</span>
                                            <span onClick={() => { removeAttr(obj._id) }}>Remove</span>
                                        </span>
                                        <span>
                                            <span>
                                                {obj.values.map((val, index) => <span key={index} onClick={() => deleteThisAttrValue(obj._id, index)} className='atr'>{val},<span className='crooss'>X</span></span>)}
                                            </span>
                                            <span onClick={() => pushNew(obj._id)}>New</span>
                                        </span>
                                    </div>
                                ))
                            }

                        </div>
                        <div className="newPush">
                            <div className="crose" onClick={() => closeNewPush()}>X</div>
                            <input type="text" name='newPushVal' onChange={onChange} value={state.newPushVal} placeholder='Add New Value' />
                            <span style={{color: "white"}}>Note: please add only one value at a time</span>
                            <button onClick={addNewPush}>Add New</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VAttributes;
