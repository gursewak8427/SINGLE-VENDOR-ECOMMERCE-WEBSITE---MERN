import React, { useEffect, useState } from 'react';
import { Redirect, Link, useHistory } from 'react-router-dom'
import axios from 'axios'
import { getTokenAdmin } from '../../helpers/auth'
import { useStateValue } from '../../StateProvider/StateProvider';
import { BottomScrollListener } from 'react-bottom-scroll-listener';

import './VOrders.css'
import { KEYS } from '../keys';

function VOrders() {
    let history = useHistory();
    const [store, dispatch] = useStateValue();
    const [count, setCount] = useState(1);
    const [empty, setEmpty] = useState(false);


    const bottomHit = () => {
        if (!empty) {
            setCount(count + 1)
        }
    }

    useEffect(() => {
        dispatch({
            type: 'SET_LOADING'
        })

        axios.post(`${KEYS.NODE_URL}/api/vendor/order/156/get`, { userId: 1, count },
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
                if (result.data.orders.length == 0) {
                    setEmpty(true)
                    return
                }
                var d = []
                if (count != 1) {
                    d = store.vendorOrders
                }
                console.log('count', count);
                console.log('d', d);
                d = d.concat(result.data.orders)
                dispatch({
                    type: 'SET_VORDERS',
                    orders: d
                })
            })
            .catch(err => {
                console.log(err)
            })
    }, [count])


    const toggleField = index => {
        document.getElementsByClassName(`dtl${index}`)[0].classList.toggle('active')
    }

    const changeStatus = (e, index, orderId) => {
        var nowTiming = new Date();
        let CorrectTime =
            nowTiming.toLocaleString("en-US", {
                timeZone: "Asia/Kolkata"
            });
        dispatch({
            type: 'SET_LOADING'
        })
        let userId = store.vendorOrders[index][0]
        if (store.vendorOrders[index][1].orderId == orderId) {
            let newNotify
            if (e.target.value == 1) {
                newNotify = `Your order is Still Pending, Order-ID: ${orderId} at ${CorrectTime}`
                store.vendorOrders[index][1].orderTime[0] = CorrectTime
                store.vendorOrders[index][1].orderTime[1] = ""
                store.vendorOrders[index][1].orderTime[2] = ""
                store.vendorOrders[index][1].orderTime[3] = ""
                store.vendorOrders[index][1].orderTime[4] = ""
            }
            if (e.target.value == 2) {
                newNotify = `Your order is in Processing, Order-ID: ${orderId} at ${CorrectTime}`
                store.vendorOrders[index][1].orderTime[1] = CorrectTime
                store.vendorOrders[index][1].orderTime[2] = ""
                store.vendorOrders[index][1].orderTime[3] = ""
                store.vendorOrders[index][1].orderTime[4] = ""
            }
            if (e.target.value == 3) {
                newNotify = `Your order is shipped, Order-ID: ${orderId} at ${CorrectTime}`
                store.vendorOrders[index][1].orderTime[2] = CorrectTime
                store.vendorOrders[index][1].orderTime[3] = ""
                store.vendorOrders[index][1].orderTime[4] = ""
            }
            if (e.target.value == 4) {
                newNotify = `Your order is delivered, Order-ID: ${orderId} at ${CorrectTime}`
                store.vendorOrders[index][1].orderTime[3] = CorrectTime
                store.vendorOrders[index][1].orderTime[4] = ""
            }
            if (e.target.value == 5) {
                newNotify = `Your order is Canceled, Order-ID: ${orderId} at ${CorrectTime}`
                store.vendorOrders[index][1].orderTime[4] = CorrectTime
            }
            store.vendorOrders[index][1].orderStatus = e.target.value
            dispatch({
                type: 'SET_VORDERS',
                orders: store.vendorOrders
            })
            axios.post(`${KEYS.NODE_URL}/api/vendor/order/156/changeStatus`, { userId, orders: store.vendorOrders },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `barear ${getTokenAdmin()}`
                    }
                })
                .then(result => {
                    let userOrders = result.data.usserOrders
                    let OrderIndex = 0;
                    userOrders.map((order, index) => {
                        if (order.orderId == orderId) {
                            OrderIndex = index
                            order.orderStatus = e.target.value
                            if (e.target.value == 1) {
                                order.orderTime[0] = CorrectTime
                                order.orderTime[1] = ""
                                order.orderTime[2] = ""
                                order.orderTime[3] = ""
                                order.orderTime[4] = ""
                            }
                            if (e.target.value == 2) {
                                order.orderTime[1] = CorrectTime
                                order.orderTime[2] = ""
                                order.orderTime[3] = ""
                                order.orderTime[4] = ""
                            }
                            if (e.target.value == 3) {
                                order.orderTime[2] = CorrectTime
                                order.orderTime[3] = ""
                                order.orderTime[4] = ""
                            }
                            if (e.target.value == 4) {
                                order.orderTime[3] = CorrectTime
                                order.orderTime[4] = ""
                            }
                            if (e.target.value == 5) {
                                order.orderTime[4] = CorrectTime
                            }
                            return
                        }
                    })
                    axios.post(`${KEYS.NODE_URL}/api/vendor/order/156/changeStatus/user`, { userId, orders: userOrders, notify: newNotify, orderIndex: OrderIndex },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `barear ${getTokenAdmin()}`
                            }
                        })
                        .then(results => {
                            dispatch({
                                type: 'UNSET_LOADING'
                            })
                        })
                        .catch(errs => {
                            console.log(errs)
                        })

                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
    const viewBill = (index, orderId) => {
        if (store.vendorOrders[index][1].orderId == orderId) {
            dispatch({
                type: 'CURRENT_INVOICE',
                order: store.vendorOrders[index]
            })
            window.location.href = KEYS.NODE_URL + `/files/invoice.html?orderIndex=${index}&baseurl=${KEYS.NODE_URL}`
            // history.push('/vendor/orders/billing')
        } else {
            alert('something Wrong')
        }
    }
    return (
        <>

            <div className="v-wrapper">
                <div className="design"></div>
                <div className="v-product">
                    <h1 className="label">My Orders</h1>
                    <div className="vorders">
                        {
                            store.vendorOrders.map((order, index) => (
                                <div key={index} className="order">
                                    <div className={`content con${index}`} onClick={() => toggleField(index)}>
                                        <span className='index'>{index + 1}</span>
                                        <span className='pricing'>({order[1].items.length} items) {order[1].orderAmount} Rs</span>
                                        <span className='payment'>{order[1].orderPayment.paymentType == 1 ? 'COD' : 'UPI'}</span>
                                        <span className='timing'>{order[1].orderTime[0]}</span>
                                    </div>
                                    <div className={`details dtl${index}`}>
                                        <div className="subTop">
                                            <span className='id'> <span>Order id: </span> {order[1].orderId}</span>
                                            <span className='payment'> <span>Transition id: </span> {order[1].orderPayment.paymentType == 2 ? order[1].orderPayment.paymentDetail.TransitionId : null}</span>
                                        </div>
                                        <div className="topDtl">
                                            <div className="address">
                                                <span>Address: </span>
                                                <button onClick={() => alert('Redirect to map...')}>{order[1].orderAddress}</button>
                                                {/* <button onClick={() => alert('Redirect to map, after activate the place api')}>{order[1].orderAddress.place}</button> */}
                                            </div>
                                            <span>
                                                <select name="status" defaultValue={order[1].orderStatus} onChange={(e) => changeStatus(e, index, order[1].orderId)}>
                                                    <option value="1">Pending</option>
                                                    <option value="2">Processing</option>
                                                    <option value="3">Shipping</option>
                                                    <option value="4">Delivered</option>
                                                    <option value="5">Canceled</option>
                                                </select>
                                                <div className='printBtn' onClick={() => viewBill(index, order[1].orderId)}>Bill</div>
                                            </span>
                                        </div>
                                        <div className="items">
                                            {
                                                order[1].items.map((item, index) => (
                                                    item.productType == 0 ? (
                                                        <div key={item.id + index} className="item">
                                                            <img src={item.coverImg} alt="" />
                                                            <div className="content">
                                                                <span>{item.name}</span>
                                                                <span>Qty: {item.itemQty}</span>
                                                                <span>Price: {item.price.price} ₹</span>
                                                            </div>
                                                        </div>
                                                    ) : item.productType == 1 ? (
                                                        <div key={item.id + index} className="item">
                                                            <img src={item.varient.general.images.length != 0 ? item.varient.general.images[0] : item.coverImg} alt="" />
                                                            <div className="content">
                                                                <span>{item.name}
                                                                    <span className='attributes'>{item.varient.varienteAttributes.map((atr, index) => index == 0 && index + 1 == item.varient.varienteAttributes.length ? (<span key={index}>({atr.value})</span>) : index == 0 ? (<span key={index}>({atr.value},</span>) : index + 1 == item.varient.varienteAttributes.length ? (<span key={index}>{atr.value})</span>) : (<span key={index}>{atr.value},</span>))} </span>
                                                                </span>
                                                                <span>Qty: {item.itemQty}</span>
                                                                <span>Price: {item.varient.general.price} ₹</span>
                                                            </div>
                                                        </div>
                                                    ) : null
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                        {
                            empty && count == 1 ? <span className='NoOrders'>Zero Orders</span> : empty && count != 1 ? <span className='NoOrders'>No More Orders</span> : null
                        }
                    </div>
                </div>
                <BottomScrollListener onBottom={bottomHit} />
            </div>
        </>
    );
}

export default VOrders;
