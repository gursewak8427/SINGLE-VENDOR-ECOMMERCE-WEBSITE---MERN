import React, { useState, useEffect } from 'react';
import { Redirect, Link, useHistory } from 'react-router-dom'
import { useStateValue } from '../../StateProvider/StateProvider';
import axios from 'axios'
import './Orders.css'
import { BottomScrollListener } from 'react-bottom-scroll-listener';
import { KEYS } from '../keys'

const Orders = () => {
    let history = useHistory();
    const [store, dispatch] = useStateValue();
    const [myOrder, setMyOrder] = useState([]);
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
        var user = store.user 
    if (user!='') {
            axios.post(`${KEYS.NODE_URL}/api/user/order/156/get`, { userId: user.id, count }).then(result => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                if (result.data.orders.length == 0) {
                    setEmpty(true)
                    return
                }
                var d = []
                if (count != 1) {
                    d = store.orders
                }
                d = d.concat(result.data.orders)
                dispatch({
                    type: 'SET_ORDERS',
                    orders: d
                })
            }).catch(err => console.log(err))
        } else {
            document.getElementById('signup').classList.add('open')
            dispatch({
                type: 'UNSET_LOADING'
            })
        }
    }, [count])

    useEffect(() => {
        window.scroll(0, 0)
        if (store.rawdata.length == 0) {
            axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getRawData`)
                .then(result => {
                    sorting(result.data.myRawData.categories, result.data.myRawData.subCategories)
                }).catch(err => console.log(err))
        } else {
            dispatch({
                type: 'UNSET_LOADING'
            })
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
        dispatch({
            type: 'UNSET_LOADING'
        })
    }

    const seeDetail = (index, orderId) => {
        // setting hover/clicked effect
        dispatch({
            type: 'SET_LOADING'
        })
        let d = document.getElementsByClassName('order')
        for (let i = 0; i < d.length; i++) {
            d[i].classList.remove('active')
        }
        document.getElementsByClassName(`ordr${orderId}`)[0].classList.add('active')
        document.getElementsByClassName('orderDetail')[0].classList.add('openDtl')
        if (store.orders[index].orderId == orderId) {
            setMyOrder([index, orderId])
            dispatch({
                type: 'UNSET_LOADING'
            })
        }
    }
    const closeDtl = () => {
        let d = document.getElementsByClassName('order')
        for (let i = 0; i < d.length; i++) {
            d[i].classList.remove('active')
        }
        document.getElementsByClassName('orderDetail')[0].classList.remove('openDtl')
        setMyOrder([])
    }
    const goToProduct = id => {
        history.push(`/item/info/${id}`);
    }
    const viewBill = (index, orderId) => {
        if (store.orders[index].orderId == orderId) {
            dispatch({
                type: 'CURRENT_INVOICE',
                order: ['00', store.orders[index]]
            })
            history.push('/orders/bill')
        } else {
            alert('something Wrong')
        }
    }
    return (
        <>
            <div className="wrapper mt-10">
                <div className="orders">
                    {
                        store.user == '' ?
                            <div className="loginFirst">
                                <img src="https://borlabs.io/wp-content/uploads/2019/09/blog-wp-login.png" alt="" />
                                <span className='a'>Please Signin/ Signup</span>
                            </div>
                            : (
                                <>
                                    <div className="left list">
                                        {
                                            store.orders.length == 0 ? (
                                                <div className="emptyOrder">
                                                    <img src="https://m.media-amazon.com/images/G/31/cart/empty/kettle-desaturated._CB424694257_.svg" alt="" />
                                                    <div className="data">
                                                        <span className='a'>Your Haven't any order</span>
                                                        <Link to='td'><span className='b'>shop today's deals</span></Link>
                                                    </div>
                                                </div>
                                            ) : (
                                                store.orders.map((order, index) => (
                                                    <div key={index} className={`order ordr${order.orderId}`}>
                                                        <div className="top">
                                                            <span>{order.orderTime[0]}</span>
                                                            <span className='status' onClick={() => seeDetail(index, order.orderId)}>{
                                                                order.orderStatus == 1 ? <span className="a">Ordered</span> :
                                                                    order.orderStatus == 2 ? <span className="b">Processing</span> :
                                                                        order.orderStatus == 3 ? <span className="c">Shipping</span> :
                                                                            order.orderStatus == 4 ? <span className="d">Delivered</span> :
                                                                                order.orderStatus == 5 ? <span className="e">Canceled</span> : null
                                                            }
                                                            </span>
                                                        </div>
                                                        <div className="dtl">
                                                            {
                                                                 order.orderStatus == 4 ? 
                                                                    <span onClick={()=>viewBill(index, order.orderId)} className='getBill'>
                                                                        &nbsp;Bill
                                                                    </span> : null
                                                            }
                                                            <span>
                                                                <span style={{ marginBottom: 0 }}>Order Id :</span>
                                                                <span>{order.orderId}</span>
                                                            </span>
                                                            <span>
                                                                <span style={{ marginBottom: 0 }}>Transition Id :</span>
                                                                <span>{order.orderPayment.paymentDetail.TransitionId}</span>
                                                            </span>
                                                        </div>
                                                        <div className="items">
                                                            {order?.items?.map((item, itemIndex) => (
                                                                item.productType == 0 ? (
                                                                    <div key={order.orderId + item.id + itemIndex} onClick={() => goToProduct(item.id)} className="item">
                                                                        <div className="left">
                                                                            <img src={item.coverImg} alt="" />
                                                                        </div>
                                                                        <div className="contentF">
                                                                            <span>{item.name}</span>
                                                                            <span><b>Qty:</b> {item.itemQty}</span>
                                                                            <span><b>Price:</b> {item.price.price} ₹</span>
                                                                        </div>
                                                                    </div>
                                                                ) : item.productType == 1 ? (
                                                                    <div key={order.orderId + item.id + itemIndex} onClick={() => goToProduct(item.id)} className="item">
                                                                        <div className="left">
                                                                            <img src={item.varient.general.images.length != 0 ? item.varient.general.images[0] : item.coverImg} alt="" />
                                                                        </div>
                                                                        <div className="contentF">
                                                                            <span>{item.name}
                                                                                <span className='attributes'>{item.varient.varienteAttributes.map((atr, index) => index == 0 && index + 1 == item.varient.varienteAttributes.length ? (<span key={order.orderId + itemIndex + atr.attr_id}>({atr.value})</span>) : index == 0 ? (<span key={order.orderId + itemIndex + atr.attr_id}>({atr.value},</span>) : index + 1 == item.varient.varienteAttributes.length ? (<span key={order.orderId + itemIndex + atr.attr_id}>{atr.value})</span>) : (<span key={order.orderId + itemIndex + atr.attr_id}>{atr.value},</span>))} </span>
                                                                            </span>
                                                                            <span><b>Qty:</b> {item.itemQty}</span>
                                                                            <span><b>Price:</b> {item.varient.general.price} ₹</span>
                                                                        </div>
                                                                    </div>
                                                                ) : null
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        }
                                        {
                                            empty && count != 1 ? <div>No More</div> : null
                                        }
                                    </div>
                                    <div className="right orderDetail">
                                        <div className="crose d" onClick={closeDtl}>X</div>
                                        <div className="box">
                                            {
                                                myOrder.length == 0 ? (
                                                    'Here is your order detail'
                                                ) : (
                                                    <>
                                                        {
                                                            console.log(store.orders)
                                                        }
                                                        {
                                                            store.orders[myOrder[0]].orderId == myOrder[1] && store.orders[myOrder[0]].orderStatus != 5 ? (
                                                                <>
                                                                    <div className="contentd">
                                                                        <div className={`line ${store.orders[myOrder[0]].orderStatus == 1 ? 'one' : store.orders[myOrder[0]].orderStatus == 2 ? 'two' : store.orders[myOrder[0]].orderStatus == 3 ? 'three' : store.orders[myOrder[0]].orderStatus == 4 ? 'four' : ''}`}><span></span></div>
                                                                        <div className="data">
                                                                            <li className={`mb-80 ${store.orders[myOrder[0]].orderStatus >= 1 ? 'active-1 now' : ''}`}>
                                                                                Ordered
                                                                                <span>{store.orders[myOrder[0]].orderTime[0]}</span>
                                                                            </li>
                                                                            <li className={`mb-80 ${store.orders[myOrder[0]].orderStatus >= 2 ? 'active-2 now' : ''}`}>
                                                                                Processing
                                                                                <span>{store.orders[myOrder[0]].orderTime[1]}</span>
                                                                            </li>
                                                                            <li className={`mb-80 ${store.orders[myOrder[0]].orderStatus >= 3 ? 'active-3 now' : ''}`}>
                                                                                Shiping
                                                                                <span>{store.orders[myOrder[0]].orderTime[2]}</span>
                                                                            </li>
                                                                            <li className={`${store.orders[myOrder[0]].orderStatus >= 4 ? 'active-4 now' : ''}`}>
                                                                                Delivered
                                                                                <span>{store.orders[myOrder[0]].orderTime[3]}</span>
                                                                            </li>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) :
                                                                store.orders[myOrder[0]].orderStatus == 5 ?
                                                                    <>
                                                                        <h4>Your order is canceled.</h4>
                                                                        <span>{store.orders[myOrder[0]].orderTime[4]}</span>
                                                                    </>
                                                                    : null
                                                        }

                                                    </>
                                                )
                                            }
                                        </div>
                                    </div>
                                </>
                            )
                    }

                </div>
                <BottomScrollListener onBottom={bottomHit} />
            </div>
        </>
    );
}

export default Orders;
