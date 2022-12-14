import React, { useEffect, useState } from 'react';
import { Redirect, Link, useHistory } from 'react-router-dom'
import axios from 'axios'
import { authenticate, isAuth } from '../../../helpers/auth'

import './Bill.css'
import { useStateValue } from '../../../StateProvider/StateProvider';

function Bill() {
    let history = useHistory();
    const [store, dispatch] = useStateValue();
    const [cin, setCInvoice] = useState('');
    // const printNow = () => {
    //     var printContents = document.getElementsByClassName('order-bill-management')[0].innerHTML;
    //     var originalContents = document.body.innerHTML;

    //     document.body.innerHTML = printContents;

    //     window.print();

    //     document.body.innerHTML = originalContents;
    // }
    useEffect(() => {
        console.log('dd',store.currentInvoice)
        if (store.currentInvoice.length == 0) {
            history.push('/orders')
        }
        let s = store.currentInvoice
        setCInvoice(s)
    }, [])
    const getTotalPrice = () => {
        let p = 0
        cin[1]?.items.map(item => item.productType == 0 ? p += parseFloat(item.price.price) : item.productType == 1 ? p += parseFloat(item.varient.general.price) : null)
        return p
    }
    return (
        <>
            <div className="order-bill-management">
                <div id='printDiv' className="ticket">
                    <img src="https://res.cloudinary.com/mycloud8427/image/upload/v1620804151/3_afcapr.png" alt="Logo" />
                    <p className="centered">
                        <br />{
                            cin[1]?.orderAddress?.place
                        }
                    </p>
                    <table>
                        <thead>
                            <tr>
                                <th className="description">Item</th>
                                <th className="quantity">Qty.</th>
                                <th className="price">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                cin[1]?.items.map(item =>
                                    item.productType == 0 ?
                                        <tr>
                                            <td className="description">{item.name}</td>
                                            <td className="quantity">{item.itemQty}</td>
                                            <td className="price">{item.price.price} ₹</td>
                                        </tr> : item.productType == 1 ?
                                            <tr>
                                                <td className="description">{item.name}</td>
                                                <td className="quantity">{item.itemQty}</td>
                                                <td className="price">{item.varient.general.price} ₹</td>
                                            </tr> : null
                                )
                            }
                            <tr>
                                <td></td>
                                <td></td>
                                <td className="price"><b>{getTotalPrice()} ₹</b></td>
                            </tr>
                        </tbody>
                    </table>
                    <div id="dtl">
                        <span>
                            <span style={{ marginBottom: 0 }}>Order Id </span>
                            <span>{cin[1]?.orderId}</span>
                        </span>
                        <span>
                            <span style={{ marginBottom: 0 }}>Transition Id </span>
                            <span>{cin[1]?.orderPayment.paymentDetail.TransitionId}</span>
                        </span>
                    </div>

                    <p className="centered">Thanks for your purchase! <br />www.mydomain.in </p>
                </div>
                {/* <button id="btnPrint" onClick={printNow} className="hidden-print">Print</button> */}
            </div>

        </>
    );
}

export default Bill;
