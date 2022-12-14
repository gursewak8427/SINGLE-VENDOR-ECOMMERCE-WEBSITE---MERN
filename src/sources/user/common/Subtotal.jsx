import React, { useEffect, useState } from 'react';
import { useStateValue } from '../../../StateProvider/StateProvider';
import axios from 'axios'
import { useHistory } from "react-router-dom";

const Subtotal = props => {
    let history = useHistory();
    const [store, dispatch] = useStateValue();

    const continueToOrder = () => {
        document.getElementById('chkBtn').disabled = true
        const randomString = Math.random().toString(36).substring(2, 8);
        var nowTiming = new Date();
        let CorrectTime =
            nowTiming.toLocaleString("en-US", {
                timeZone: "Asia/Kolkata"
            });
        // 1 = COD, 2 = UPI
        console.log(store.orders.length)
        let order = {
            // order-id = userId + numberOfOrders + randomString
            orderId: store.orders.length + "" + Date.now() + randomString,
            items: store.cart,
            orderStatus: 1,
            orderAmount: store.cartTotal,
            orderPayment: undefined,
            orderTime: [CorrectTime,'','','',''],
            orderAddress: []
        }

        // Set Current Order
        dispatch({ type: 'SET_CURRENT_ORDER', order: [order] })
        document.getElementById('chkBtn').disabled = false
        history.push(`payment/${order.orderId}`);

    }

    return (
        <div className="box subtotal">
            <div className="total">
                Subtotal: ({store.cart.length} items) <span>{store.cartTotal} Rs</span>
            </div>
            <button id='chkBtn' className={`checkoutBtn ${store.cartTotal == 0 ? 'disabled' : ''}`} onClick={continueToOrder}>Continue</button>
        </div>
    )
}

export default Subtotal