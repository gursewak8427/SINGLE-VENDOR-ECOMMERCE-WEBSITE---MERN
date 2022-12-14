import { BottomScrollListener } from 'react-bottom-scroll-listener';
import React, { useEffect, useState } from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'
import { getTokenAdmin } from '../../helpers/auth'

import './VManage.css'
import { KEYS } from '../keys';
import { useStateValue } from '../../StateProvider/StateProvider';

function VManage() {
    const [store, dispatch] = useStateValue();
    const [state, setState] = useState({
        task: 1,
        catList: [],
        subCatList: [],
        myCategory: undefined,
        mySubCategory: undefined,
        productList: [],
        empty: false,
        nEmpty: false,
    })
    const [count, setCount] = useState(1)

    const bottomHit = () => {
        if (!state.nEmpty) {
            setCount(count + 1)
        }
    }

    useEffect(() => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getRawData`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                if (result.data.myRawData.categories.length > 0) {
                    state.catList = []
                    state.subCatList = []
                    state.catList = result.data.myRawData.categories
                    state.subCatList = result.data.myRawData.subCategories
                    setState({
                        ...state,
                        catList: state.catList,
                        subCatList: state.subCatList,
                    })
                } else {
                    setState({
                        ...state,
                        empty: true
                    })
                }
                dispatch({
                    type: 'UNSET_LOADING'
                })
            })
            .catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log(err);
            })

    }, [])
    const setCatIndex = (e, id) => {
        state.catList.map(cat => (
            cat._id == id ? cat.categoryIndex = e.target.value : null
        ))
        setState({ ...state, catList: state.catList });
    }
    const setSubCatIndex = (e, id) => {
        state.subCatList.map(subCat => (
            subCat._id == id ? subCat.subCategoryIndex = e.target.value : null
        ))
        setState({ ...state, subCatList: state.subCatList });
    }
    const saveCatIndex = () => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/setCategoryIndex`, { categories: state.catList },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                state.catList = []
                state.catList = result.data.myCategories
                setState({
                    ...state,
                    catList: state.catList,
                });
                dispatch({
                    type: 'UNSET_LOADING'
                })
                alert('saved')
            })
            .catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log(err)
            })
    }
    const saveSubCatIndex = () => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/setSubCategoryIndex`, { subCategories: state.subCatList },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                state.subCatList = []
                state.subCatList = result.data.mySubCategories
                setState({
                    ...state,
                    subCatList: state.subCatList,
                });
                dispatch({
                    type: 'UNSET_LOADING'
                })
                alert('saved')
            })
            .catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log(err)
            })
    }
    const setCat = cat => {
        setState({ ...state, myCategory: cat, task: 2 });
    }

    useEffect(() => {
        console.log('changed')
        if (state.myCategory && state.mySubCategory) {
            setSubCat(state.mySubCategory)
        }
    }, [count])

    const setSubCat = subCat => {
        dispatch({
            type: 'SET_LOADING'
        })
        var data = {
            category: state.myCategory,
            subCategory: subCat,
            count,
            limit: 18
        }
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/product/get/categoryAndSubCategory`, data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                if (result.data.myProducts.length == 0) {
                    if (count == 1) {
                        setState({ ...state, task: 3 })
                    } else {
                        setState({ ...state, nEmpty: true, task: 3 })
                    }
                } else {
                    if (count == 1) {
                        window.scroll(0, 0)
                        state.productList = []
                    }
                    state.productList = state.productList.concat(result.data.myProducts)
                    setState({ ...state, mySubCategory: subCat, task: 3, productList: state.productList, nEmpty: false });
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
    }

    const changeCatStatus = (status, index) => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/setCategoryStatus`, { index, status },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                state.catList = []
                state.catList = result.data.myCategories
                setState({
                    ...state,
                    catList: state.catList,
                });
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
    }
    const changeSubCatStatus = (status, id) => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/setSubCategoryStatus`, { id, status },
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
                state.subCatList = []
                state.subCatList = result.data.mySubCategories
                setState({
                    ...state,
                    subCatList: state.subCatList,
                });
            })
            .catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log(err)
            })
    }
    const deleteProduct = (id, index) => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/deleteProduct`, { id },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                let pro = state.productList
                pro.splice(index, 1)
                setState({
                    ...state,
                    productList: pro
                })
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
    }

    const goToHome = () => {
        setState({
            ...state,
            task: 1,
            myCategory: undefined,
            mySubCategory: undefined,
            productList: [],
            empty: false,
            nEmpty: false,
        })
        setCount(1)
    }

    const deleteCat = (index, catId) => {
        let isOk = window.confirm("Products also delete under this category, Please Confirm to delete");
        if (isOk) {
            dispatch({
                type: 'SET_LOADING'
            })
            axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/deleteCategory`, { index, catId },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `barear ${getTokenAdmin()}`
                  }
            })
                .then(result => {
                    let pro = state.catList
                    pro.splice(index, 1)
                    setState({
                        ...state,
                        catList: pro
                    })
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
        }

    }

    const deleteSubCat = (index, subCatId) => {
        let isOk = window.confirm("Products also delete under this sub-category, Please Confirm to delete");
        if (isOk) {
            dispatch({
                type: 'SET_LOADING'
            })
            axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/deleteSubCategory`, { index, subCatId },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `barear ${getTokenAdmin()}`
                  }
            })
                .then(result => {
                    let pro = state.subCatList
                    pro.splice(index, 1)
                    setState({
                        ...state,
                        subCatList: pro
                    })
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
        }
    }

    return (
        <>
            <div className="v-wrapper">
                <div className="design"></div>
                <div className="v-product">
                    <h1 className="label">Top Management</h1>
                    <div className="product-content top">
                        {
                            state.task == 1 ? (
                                <div className="catList box">
                                    <label htmlFor="">Categories</label>
                                    {
                                        state.empty ? <span style={{ color: "white", margin: "10px 0" }}>No Category Available</span> : null
                                    }
                                    {
                                        state.catList.map((cat, index) => (
                                            <div key={cat._id} className={`catSubList`}>
                                                <span>
                                                    <input type="text" onChange={(e) => { setCatIndex(e, cat._id) }} value={cat.categoryIndex} />
                                                    <span onClick={() => setCat(cat)}>{cat.categoryName}</span>
                                                </span>
                                                <span>
                                                    {
                                                        cat.categoryStatus == 1 ?
                                                            <button className='status deactive' onClick={() => changeCatStatus(0, index)}>Deactive</button> :
                                                            <button className='status active' onClick={() => changeCatStatus(1, index)}>Active</button>
                                                    }
                                                    <button className='status deactive' onClick={() => deleteCat(index, cat._id)}>Delete</button>
                                                </span>
                                            </div>
                                        ))
                                    }
                                    {
                                        !state.empty ? <button onClick={saveCatIndex}>Save</button> : null
                                    }
                                </div>
                            ) : state.task == 2 ? (
                                <div className="catList box">
                                    <div className="subTop">
                                        <button className='back' onClick={goToHome}>Home</button>
                                    </div>
                                    <label htmlFor="">Sub Categories [ <span>{state?.myCategory?.categoryName}</span> ]</label>
                                    {
                                        state.subCatList.map((subCat, index) => (
                                            subCat.subCategoryParent == state.myCategory._id ? (

                                                <div key={subCat._id} className="catSubList">
                                                    <span>
                                                        <input type="text" onChange={(e) => { setSubCatIndex(e, subCat._id) }} value={subCat.subCategoryIndex} />
                                                        <span onClick={() => setSubCat(subCat)}>{subCat.subCategoryName}</span>
                                                    </span>
                                                    <span>
                                                        {
                                                            subCat.subCategoryStatus == 1 ?
                                                                <button className='status deactive' onClick={() => changeSubCatStatus(0, subCat._id)}>Deactive</button> :
                                                                <button className='status active' onClick={() => changeSubCatStatus(1, subCat._id)}>Active</button>
                                                        }
                                                        <button className='status deactive' onClick={() => deleteSubCat(index, subCat._id)}>Delete</button>
                                                    </span>
                                                </div>
                                            ) : null
                                        ))
                                    }
                                    <button onClick={saveSubCatIndex}>Save</button>
                                </div>
                            ) : state.task == 3 ? (
                                <BottomScrollListener onBottom={bottomHit}>
                                    {(scrollRef) =>
                                        <div className="productList">
                                            <div className="subTop">
                                                <button className='back' onClick={goToHome}>Home</button>
                                            </div>
                                            {
                                                state.productList.length == 0 ? <span style={{ color: "white", margin: "10px 0" }}>No Product Available</span> : null
                                            }
                                            {
                                                state.productList.map((product, index) => (
                                                    <div className="product" key={product._id}>
                                                        <div className="img">
                                                            {product.CoverImages.length > 0 ? (
                                                                <img src={product.CoverImages[0]} />
                                                            ) : (
                                                                <img src="data:image/png;base64,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" />
                                                            )}
                                                        </div>
                                                        <span>{product.productName}</span>
                                                        <div className="details">
                                                            <span><Link to={`/vendor/product/${product._id}`}>Edit</Link></span>
                                                            <span onClick={() => deleteProduct(product._id, index)}>Delete</span>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    }
                                </BottomScrollListener>
                            ) : null
                        }
                        {
                            state.nEmpty ? <div onClick={() => window.scroll(0, 0)} className='No_More'>No More Products, Go To Top</div> : null
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default VManage;
