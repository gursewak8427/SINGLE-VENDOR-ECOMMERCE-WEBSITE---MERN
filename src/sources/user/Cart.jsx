import React, { useEffect, useState } from 'react';
import { Redirect, Link } from 'react-router-dom'
import { isAuthUser } from '../../helpers/auth'
import { useStateValue } from '../../StateProvider/StateProvider';
import axios from 'axios'
import './Cart.css'
import Subtotal from './common/Subtotal';
import { KEYS } from '../keys'
import { BottomScrollListener } from 'react-bottom-scroll-listener';
import { ToastContainer, toast } from 'react-toastify';
import Product from './common/Product';

function Cart() {
    const [state, setState] = useState({
        actualItemQty: [],
        suggestProductList: []
    })
    const [store, dispatch] = useStateValue();
    const [count, setCount] = useState(1);
    const [empty, setEmpty] = useState(false);

    const bottomHit = () => {
        if (!empty) {
            setCount(count + 1)
        }
    }

    const getSuggestedProducts = () => {
        if (!empty && store.user != '') {
            // fetch Suggested Products
            axios.post(`${KEYS.NODE_URL}/api/user/getSuggestProducts`, { userId: store.user?.id })
                .then(result => {
                    state.suggestProductList = []
                    result.data.items.map(img => state.suggestProductList.push(img))
                    setState({
                        ...state,
                        suggestProductList: state.suggestProductList,
                    })
                }).catch(err => {
                    console.log(err)
                })
        }
    }

    useEffect(() => {
        getSuggestedProducts()
    }, [])


    useEffect(() => {
        dispatch({
            type: 'SET_LOADING'
        })
        var user = store.user
        if (user != '' && user) {
            axios.post(`${KEYS.NODE_URL}/api/user/cart/156/get`, { userId: user.id, count })
                .then(result => {
                    dispatch({
                        type: 'UNSET_LOADING'
                    })
                    if (result.data.cart.length == 0) {
                        setEmpty(true)
                        return
                    }
                    var d = []
                    if (count != 1) {
                        d = store.cart
                    }
                    d = d.concat(result.data.cart)
                    dispatch({
                        type: 'SET_CART',
                        items: d
                    })
                    state.actualItemQty = []
                    d.map(item => {
                        let var_id = item.productType == 1 ? item.varient._id : 0
                        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/getQty?p_id=${item.id}&var_id=${var_id}`, { 'pt': item.productType })
                            .then(results => {
                                state.actualItemQty.push(results.data.qty)
                            }).catch(err => {
                                console.log(err)
                            })
                    })
                    setState({
                        ...state,
                        actualItemQty: state.actualItemQty
                    })

                })
                .catch(err => {
                    console.log(err)
                })
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

    const removeToCart = (productId, cartIndex) => {

        if (cartIndex % 2 == 0) {
            document.getElementsByClassName(`item${cartIndex}${productId}`)[0].classList.add('itemRemovedProcess-a')
        } else {
            document.getElementsByClassName(`item${cartIndex}${productId}`)[0].classList.add('itemRemovedProcess-b')
        }

        setTimeout(function () {
            // document.getElementsByClassName(`item${cartIndex}${productId}`)[0].classList.add('itemRemovedSuccess')
        }, 700);

        // document.getElementById('shortLoading').style.display = 'block'
        let objs = document.getElementsByClassName('cartItemRemoveBtn')
        for (let i = 0; i < objs.length; i++) {
            objs[i].disabled = true
        }

        var cart = store.cart
        var preventCart = cart
        if (cart[cartIndex].id == productId) {
            cart.splice(cartIndex, 1)
        }
        axios.post(`${KEYS.NODE_URL}/api/user/cart/156/set`, { userId: store.user.id, cart })
            .then(result => {
                let objs = document.getElementsByClassName('cartItemRemoveBtn')
                for (let i = 0; i < objs.length; i++) {
                    objs[i].disabled = false
                }
                dispatch({
                    type: 'SET_CART',
                    items: cart
                })
                // document.getElementById('shortLoading').style.display = 'none'
                toast.success('Removed Successfull')
            })
            .catch(err => {
                let objs = document.getElementsByClassName('cartItemRemoveBtn')
                for (let i = 0; i < objs.length; i++) {
                    objs[i].disabled = false
                }
                toast.error('Something Wrong')
                // document.getElementById('shortLoading').style.display = 'none'
                dispatch({
                    type: 'SET_CART',
                    items: preventCart
                })
                // alert('removed-failed')
            })
    }
    const setCart = () => {
        // document.getElementById('shortLoading').style.display = 'block'
        axios.post(`${KEYS.NODE_URL}/api/user/cart/156/set`, { userId: store.user.id, cart: store.cart })
            .then(result => {
                // document.getElementById('shortLoading').style.display = 'none'
                toast.success('Updated Successfull')
                dispatch({
                    type: 'SET_CART',
                    items: store.cart
                })
            })
            .catch(err => {
                // document.getElementById('shortLoading').style.display = 'none'
                dispatch({
                    type: 'SET_CART',
                    items: store.cart
                })
            })
    }

    const increaseQty = index => {
        let tempCart = store.cart
        if (tempCart[index].itemQty != state.actualItemQty[index]) {
            tempCart[index].itemQty += 1
        }
        let cT = store.cartTotal
        dispatch({
            type: 'SET_CART',
            items: tempCart
        })
    }
    const decreaseQty = index => {
        let tempCart = store.cart
        if (tempCart[index].itemQty != 1) {
            tempCart[index].itemQty -= 1
        }
        dispatch({
            type: 'SET_CART',
            items: tempCart
        })
    }

    return (
        <>
            <div className="wrapper">
                <ToastContainer />
                <div className="cart">
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
                                            store.cart.length == 0 ? (
                                                <div className="emptyCart">
                                                    <img src="https://m.media-amazon.com/images/G/31/cart/empty/kettle-desaturated._CB424694257_.svg" alt="" />
                                                    <div className="data">
                                                        <span className='a'>Your Cart is empty</span>
                                                        <Link to='td'><span className='b'>shop today's deals</span></Link>
                                                    </div>
                                                </div>
                                            ) : (
                                                store.cart.map((item, index) => (
                                                    item.productType == 0 ? (
                                                        <div key={index} className={`item item${index}${item.id}`}>
                                                            <div className="top">
                                                                <div className="left">
                                                                    <img src={item.coverImg} alt="" />
                                                                </div>
                                                                <div className="contentCart">
                                                                    <span>{item.name}</span>
                                                                    <span>Price: {item.price.price} ₹</span>
                                                                    <span className='itemQty'>
                                                                        <div className="decQty" onClick={() => decreaseQty(index)}>-</div>
                                                                        <input type="text" value={item.itemQty} readOnly />
                                                                        <div className="incQty" onClick={() => increaseQty(index)}>+</div>
                                                                        <button className='update' onClick={() => setCart()}>update</button>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="bottom">
                                                                <button className='danger cartItemRemoveBtn' onClick={() => removeToCart(item.id, index)}>romove</button>
                                                            </div>
                                                        </div>
                                                    ) : item.productType == 1 ? (
                                                        <div key={index} className={`item item${index}${item.id}`}>
                                                            <div className="top">
                                                                <div className="left">
                                                                    <img src={item.varient.general.images.length != 0 ? item.varient.general.images[0] : item.coverImg} alt="" />
                                                                </div>
                                                                <div className="contentCart">
                                                                    <span className='nn'>
                                                                        <span>
                                                                            {item.name}
                                                                        </span>
                                                                        <span className='attributes'>{item.varient.varienteAttributes.map((atr, index) => index == 0 && index + 1 == item.varient.varienteAttributes.length ? (<span key={index}>({atr.value})</span>) : index == 0 ? (<span key={index}>({atr.value},</span>) : index + 1 == item.varient.varienteAttributes.length ? (<span key={index}>{atr.value})</span>) : (<span key={index}>{atr.value},</span>))} </span>
                                                                    </span>
                                                                    <span>Price: {item.varient.general.price} ₹</span>
                                                                    <span className='itemQty'>
                                                                        <div className="decQty" onClick={() => decreaseQty(index)}>-</div>
                                                                        <input type="text" value={item.itemQty} readOnly />
                                                                        <div className="incQty" onClick={() => increaseQty(index)}>+</div>
                                                                        <button className='update' onClick={() => setCart()}>update</button>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="bottom">
                                                                <button className='danger' onClick={() => removeToCart(item.id, index)}>romove</button>
                                                            </div>
                                                        </div>
                                                    ) : null
                                                ))

                                            )
                                        }
                                        {
                                            empty && count != 1 ? <div>No More</div> : null
                                        }
                                    </div>
                                    <div className="right checkout">
                                        <Subtotal />
                                    </div>
                                </>
                            )
                    }
                </div>
                <div id='SuggestedProducts'>
                    {
                        state.suggestProductList.length == 0 ? null :
                            <div className="row-slider a aa">
                                <div className="header">
                                    <div className="label">{store.user.name}, Similar Products</div>
                                    {/* <div className="right">
                                                    <button onClick={() => alert('view all in pending')}>view all</button>
                                                </div> */}
                                </div>
                                <div className="items">
                                    {
                                        state.suggestProductList.map((product, productIndex) => {
                                            return ((product.productPricing == undefined || product.productPricing.price == "") && (product.productType == 0) || (product.productStatus == 0)) ? null : (
                                                <Product
                                                    key={productIndex}
                                                    product={product}
                                                    productIndex={productIndex}
                                                    refreshPage={true}
                                                />
                                            )
                                        })
                                    }
                                </div>
                            </div>
                    }
                </div>
                <BottomScrollListener onBottom={bottomHit} />
            </div>
        </>
    );
}

export default Cart;
