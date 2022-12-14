import React, { useEffect, useState } from 'react';
import { GoogleComponent } from 'react-google-location'
import { useStateValue } from '../../../StateProvider/StateProvider';
import { useHistory } from "react-router-dom";
import axios from 'axios'
import './Payment.css'
import { KEYS } from '../../keys';
import { toast } from 'react-toastify';

const Payment = (props) => {
    let history = useHistory();
    const API_KEY = 'AIzaSyAb34F6xmw0e6-MBpAdNSvc6iUGNumDKdQ'
    const [store, dispatch] = useStateValue();

    const [state, setState] = useState({
        cod: false,
        address: "",
        city: "",
        district: "",
        pincode: "",
        nearby: "",
    })

    useEffect(() => {
        axios.post(`${KEYS.NODE_URL}/api/vendor/156/getCOD`)
            .then(result => {
                setState({
                    ...state,
                    cod: result.data.cod
                })
            })
    }, [])

    useEffect(() => {
        if (store.currentOrder.length == 0) { history.push(`/`) }
    }, [])

    const options = {
        key: 'rzp_test_DFna8BrjZu7dKG',
        amount: parseInt(store?.currentOrder[0]?.orderAmount) * 100,
        name: 'Style Factory',
        description: 'Best of Luck',
        image: 'https://cdn.razorpay.com/logos/7K3b6d18wHwKzL_medium.png',
        // <========== oN_sUCcesS ==========>
        handler: function (response) {
            dispatch({ type: 'SET_LOADING' })
            document.getElementById('shortLoading').style.display = 'block'
            var ordr = store.currentOrder[0]
            console.log("#ordr")
            console.log(ordr)
            ordr.orderPayment = {
                paymentType: 2,
                paymentDetail: {
                    TransitionId: response.razorpay_payment_id,
                }
            }
            // ordr.orderAddress = state.place
            // order to database
            axios.post(`${KEYS.NODE_URL}/api/user/order/156/add`, { userId: store.user.id, order: ordr })
                .then(result => {
                    // decrease quantity of products
                    ordr.items.map(item => {
                        let var_id = item.productType == 1 ? item.varient._id : 0
                        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/setQty?p_id=${item.id}&var_id=${var_id}`, { 'pt': item.productType, 'qty': item.itemQty }).catch(err => console.log(err))
                    })
                    dispatch({ type: 'SET_ORDERS', orders: result.data.orders })
                    // empty cart after order
                    axios.post(`${KEYS.NODE_URL}/api/user/cart/156/set`, { userId: store.user.id, cart: [] })
                        .then(result => {
                            document.getElementById('shortLoading').style.display = 'none'
                            dispatch({ type: 'UNSET_LOADING' })
                            dispatch({ type: 'SET_CART', items: [] })
                            dispatch({ type: 'SET_CURRENT_ORDER', order: [] })
                            history.push(`/orders`);
                        }).catch(err => {
                            console.log(err)
                            document.getElementById('shortLoading').style.display = 'none'
                            dispatch({ type: 'UNSET_LOADING' })
                        })

                })
                .catch(err => {
                    document.getElementById('shortLoading').style.display = 'none'
                    dispatch({ type: 'UNSET_LOADING' })
                    console.log(err.response.data.error)
                })
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)
        },
        prefill: {
            name: store.user.name,
            contact: store.user.phone,
        },
        notes: {
            address: state.place?.place
        },
        theme: {
            color: '#09c28a',
            hide_topbar: false
        },
        "modal": {
            "ondismiss": function () {
                document.getElementById('shortLoading').style.display = 'none'
                dispatch({ type: 'UNSET_LOADING' })
            }
        }
    };
    const orderCOD = () => {
        dispatch({ type: 'SET_LOADING' })
        document.getElementById('shortLoading').style.display = 'block'
        var ordr = store.currentOrder[0]
        ordr.orderPayment = {
            paymentType: 1,
            paymentDetail: 'nothing'
        }
        ordr.orderAddress = state.place
        axios.post(`${KEYS.NODE_URL}/api/user/order/156/add`, { userId: store.user.id, order: ordr })
            .then(result => {
                // decrease quantity of products
                ordr.items.map(item => {
                    let var_id = item.productType == 1 ? item.varient._id : 0
                    axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/setQty?p_id=${item.id}&var_id=${var_id}`, { 'pt': item.productType, 'qty': item.itemQty }).catch(err => console.log(err))
                })
                dispatch({ type: 'SET_ORDERS', orders: result.data.orders })
                // empty cart after order
                axios.post(`${KEYS.NODE_URL}/api/user/cart/156/set`, { userId: store.user.id, cart: [] })
                    .then(result => {
                        dispatch({ type: 'UNSET_LOADING' })
                        document.getElementById('shortLoading').style.display = 'none'
                        dispatch({ type: 'SET_CART', items: [] })
                        dispatch({ type: 'SET_CURRENT_ORDER', order: [] })
                        history.push(`/orders`);
                    }).catch(err => {
                        dispatch({ type: 'UNSET_LOADING' })
                        document.getElementById('shortLoading').style.display = 'none'
                        console.log(err)
                    })

            })
            .catch(err => {
                dispatch({ type: 'UNSET_LOADING' })
                document.getElementById('shortLoading').style.display = 'none'
                console.log(err)
            })
    }
    const openPayModal = () => {
        let order = store.currentOrder
        console.log(state)
        if(state.address == "" || state.city == "" || state.district == "" || state.nearby == "" || state.pincode == "")
        {
            alert("All Fields are required");
            return;
        }
        order[0].orderAddress = `Address: ${state.address} || City: ${state.city} || District: ${state.district} || NearBy: ${state.nearby} || Pincode: ${state.pincode}`;
        // Set Current Order
        console.log("#order")
        console.log(order)
        dispatch({ type: 'SET_CURRENT_ORDER', order })
        var rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            document.getElementById('shortLoading').style.display = 'none'
            console.log('failed')
            // alert(response.error.code);
            // alert(response.error.description);
            // alert(response.error.source);
            // alert(response.error.step);
            // alert(response.error.reason);
            // alert(response.error.metadata.order_id);
            // alert(response.error.metadata.payment_id);
        });
        rzp1.open();
    };
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);


    const setValue = (e) => {
        setState({
            ...state,
            [e.target.name] : e.target.value
        })
    }

    return (
        <>
            <div className="addressContainer">
                <h3>Address of Order's Delivery</h3>


                <input type="text" name="address" className='addressInput' placeholder='Address*' onChange={(e) => { setValue(e) }} />
                <input type="text" name="city" className='addressInput' placeholder='City*' onChange={(e) => { setValue(e) }} />
                <input type="text" name="district" className='addressInput' placeholder='District*' onChange={(e) => { setValue(e) }} />
                <input type="text" name="nearby" className='addressInput' placeholder='Near by*' onChange={(e) => { setValue(e) }} />
                <input type="text" name="pincode" className='addressInput' placeholder='Pincode*' onChange={(e) => { setValue(e) }} />
                <button onClick={openPayModal} className='addressButtonCheckout'>Checkout</button>


                {/* <div className="right">
                    <GoogleComponent
                        apiKey={API_KEY}
                        language={'en'}
                        country={'country:in'}
                        coordinates={true}
                        onChange={(e) => { setState({ ...state, place: e }) }}
                    />
                    {(state.place == null) || (state?.place?.place == "") ? <button className='disabled' onClick={openPayModal}>Checkout</button> : <button onClick={openPayModal}>Checkout</button>}
                    {
                        state.cod ?
                            <>
                                {(state.place == null) || (state?.place?.place == "") ? <button className='disabled' onClick={orderCOD}>CASH ON DELIVERY</button> : <button onClick={orderCOD}>CASH ON DELIVERY</button>}
                            </>
                            : null
                    }
                </div> */}
            </div>
        </>
    );
};

export default Payment