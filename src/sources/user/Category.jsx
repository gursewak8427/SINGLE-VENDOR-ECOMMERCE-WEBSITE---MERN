import { BottomScrollListener } from 'react-bottom-scroll-listener';
import React, { useEffect, useState } from 'react';
import { Redirect, Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { authenticate, isAuth } from '../../helpers/auth'
import Product from './common/Product';
import './Category.css'
import { useStateValue } from '../../StateProvider/StateProvider';
import { useHistory } from "react-router-dom";
import { KEYS } from '../keys'
import { ToastContainer } from 'react-toastify';

function Category() {
    let history = useHistory();
    const { cat, subCat } = useParams()
    const category = JSON.parse(cat)

    const [store, dispatch] = useStateValue();
    const [state, setState] = useState({
        productList: [],
        subCatList: [],
        filterCat: category._id,
        filterSubCat: subCat,
        empty: false
    })
    const [catList, setCatList] = useState([])
    const [subCatList, setSubCatList] = useState([])

    const [count, setCount] = useState(1)

    const bottomHit = () => {
        if (!state.empty) {
            setCount(count + 1)
        }
    }

    // on count change fetch more data
    useEffect(() => {
        console.log(count);
        dispatch({
            type: 'SET_LOADING'
        })
        let data = {
            category,
            count,
            limit: 20
        }
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/product/get/category`, data)
            .then(result => {
                if (result.data.myCollection.myProducts.length == 0) {
                    if(count == 1){
                        state.productList = []
                    }
                    setState({ 
                        ...state,
                        productList: state.productList,
                        empty: true,
                        filterSubCat: subCat
                    })
                } else {
                    if (count == 1) {
                        let d = document.getElementsByClassName('sc' + subCat)
                        d[0].scrollIntoView(false)
                        window.scroll(0, 0)
                        state.productList = []
                    }
                    state.productList = state.productList.concat(result.data.myCollection.myProducts)
                    setState({
                        ...state,
                        productList: state.productList,
                        filterSubCat: subCat,
                        empty: false
                    });
                }
                dispatch({
                    type: 'UNSET_LOADING'
                })
            })
            .catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log(err)
            })
    }, [count, cat, subCat])

    // raw data 
    useEffect(() => {
        if (store.rawdata.length != 0) {
            state.subCatList = []
            store.rawdata.subCategories.map(sc =>
                sc.subCategoryParent == category._id ?
                    state.subCatList.push(sc) :
                    null
            )
            setState({
                ...state,
                subCatList: state.subCatList
            })
        } else {
            axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getRawData`)
                .then(result => {
                    state.subCatList = []
                    result.data.myRawData.subCategories.map(sc =>
                        sc.subCategoryParent == category._id ?
                            state.subCatList.push(sc) :
                            null
                    )
                    setState({ ...state, subCatList: state.subCatList });
                    sorting(result.data.myRawData.categories, result.data.myRawData.subCategories)
                })
        }
    }, [cat, subCat])

    // sorting subcat
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
            setCatList(catList)
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
            setSubCatList(subCatList)
        }
        dispatch({
            type: 'ADD_TO_RAWDATA',
            data: {
                categories: catList,
                subCategories: subCatList
            }
        })
    }


    const setSubCat = id => {
        let ii
        if (id) {
            ii = id
        } else {
            ii = -1
        }
        if (state.filterSubCat != ii) {
            setState({ ...state, filterSubCat: ii, empty: false })
            setCount(1)
            history.push(`/c/${cat}/${ii}`);
        }
    }

    return (
        <div className="wrapper">
            <ToastContainer
                position="bottom-right"
            />
            <div className="categoryTop">
                <div className="main">
                    <i className="fas fa-arrow-circle-left"></i>
                    <Link to='/'><span>{category.categoryName}</span></Link>
                </div>
                <div className="list">
                    <li className={`sc sc${-1} ${state.filterSubCat == -1 ? 'active' : ''}`} onClick={() => setSubCat(undefined)}>All</li>
                    {
                        state.subCatList.map(sc => sc.subCategoryStatus == 1 ? <li key={sc._id} className={`sc sc${sc._id} ${state.filterSubCat == sc._id ? 'active' : ''}`} onClick={() => setSubCat(sc._id)}>{sc.subCategoryName}</li> : null)
                    }
                </div>
            </div>
            <div className={`items categoryPage ${state.productList.length < 5 ? 'center' : ''}`}>
                {
                    state.productList == 0 ? <span>Sorry, No Product</span> : null
                }
                {
                    state.productList.map((product, productIndex) => {
                        return ((product.productPricing == undefined || product.productPricing.price == "") && (product.productType == 0) || (product.productStatus == 0)) ? null : (
                            state.filterSubCat != -1 ?
                                product.productParents.subCategory == state.filterSubCat ?
                                    <Product
                                        key={productIndex}
                                        product={product}
                                        productIndex={productIndex}
                                    /> :
                                    null :
                                <Product
                                    key={productIndex}
                                    product={product}
                                    productIndex={productIndex}
                                />
                        )
                    })
                }
            </div>
            {
                state.empty ? (
                    <div className="backToTop-user" onClick={() => window.scroll(0, 0)}>
                        Back To Top
                    </div>
                ) : null
            }
            <BottomScrollListener onBottom={bottomHit} />
        </div>
    );
}

export default Category;
