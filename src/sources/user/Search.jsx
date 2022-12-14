import React, { useState, useEffect } from 'react';
import { Redirect, Link, useParams, useHistory } from 'react-router-dom'
import axios from 'axios'
import { StateProvider, useStateValue } from '../../StateProvider/StateProvider';
import './ProductDetail.css'
import { KEYS } from '../keys'
import './Search.css'
import Product from './common/Product';
import { BottomScrollListener } from 'react-bottom-scroll-listener';

const Search = (props) => {
    let history = useHistory();
    const { searchItem } = useParams()
    const [store, dispatch] = useStateValue();
    const [listItems, setListItems] = useState([])
    const [count, setCount] = useState(1)
    const [state, setState] = useState({
        empty: false,
        sortingMethod: 1,
        minPrice: -1,
        maxPrice: -1,
        minMaxPrice: [-1, -1],
        filterCategory: -1,
        filterCatName: 'all',
        wait: false,
    })

    const bottomHit = () => {
        if (!state.empty) {
            setCount(count + 1)
        }
    }


    // on count change fetch more data
    useEffect(() => {
        if (count == 1) {
            window.scroll(0, 0)
        }
        console.log('a')
        if (state.wait) {
            console.log('b')
            return
        }
        console.log('c')
        setState({
            ...state,
            wait: true
        })
        dispatch({
            type: 'SET_LOADING'
        })
        let data = {
            item: searchItem,
            count,
            limit: 20,
            sortingMethod: state.sortingMethod,
            priceRange: state.minMaxPrice,
            filterCategory: state.filterCategory
        }
        axios.post(`${KEYS.NODE_URL}/api/user/search`, data).then(result => {
            if (result.data.items.length == 0) {
                setState({ ...state, empty: true, wait: false })
            } else {
                let d = listItems.concat(result.data.items)
                setListItems(d)
                setState({ ...state, empty: false, wait: false })
            }
            dispatch({ type: 'UNSET_LOADING' })
            dispatch({ type: 'SET_SEARCH_ITEM', item: searchItem })
        }).catch(err => {
            dispatch({ type: 'UNSET_LOADING' })
            setState({ ...state, empty: false, wait: false })
            console.log(err)
        })
    }, [count])

    useEffect(() => {
        if (count == 1) {
            window.scroll(0, 0)
        }
        if (state.wait) {
            return
        }
        setState({
            ...state,
            wait: true
        })
        console.log('wait set')
        dispatch({
            type: 'SET_LOADING'
        })
        let data = {
            item: searchItem,
            count: 1,
            limit: 20,
            sortingMethod: state.sortingMethod,
            priceRange: state.minMaxPrice,
            filterCategory: state.filterCategory
        }
        axios.post(`${KEYS.NODE_URL}/api/user/search`, data).then(result => {
            if (result.data.items.length == 0) {
                setState({ ...state, empty: true, wait: false })
                setListItems([])
            } else {
                let d = []
                result.data.items.map(item => d.push(item))
                setListItems(d)
                setState({ ...state, empty: false, wait: false })
                setCount(1)
            }
            dispatch({ type: 'UNSET_LOADING' })
            dispatch({ type: 'SET_SEARCH_ITEM', item: searchItem })
        }).catch(err => {
            dispatch({
                type: 'UNSET_LOADING'
            })
            setState({ ...state, empty: false, wait: false })
            console.log(err)
        })
    }, [searchItem, state.sortingMethod, state.minMaxPrice, state.filterCategory])

    // raw data 
    useEffect(() => {
        if (store.rawdata.length == 0) {
            axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getRawData`)
                .then(result => {
                    sorting(result.data.myRawData.categories, result.data.myRawData.subCategories)
                })
        }
    }, [])
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
    }

    const setSorting = type => {
        setState({
            ...state,
            sortingMethod: type
        })
    }
    const setFilter = type => {
        if (type == "price") {
            document.getElementById('filterBox').classList.toggle('active')
            document.getElementsByClassName('sortBtnFixed')[0].classList.toggle('active')
            setState({
                ...state,
                minMaxPrice: [state.minPrice == '' ? -1 : parseInt(state.minPrice), state.maxPrice == '' ? -1 : parseInt(state.maxPrice)]
            })
        }
    }
    const onChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    const setFilterCategory = (id, name) => {
        document.getElementById('filterBox').classList.toggle('active')
        document.getElementsByClassName('sortBtnFixed')[0].classList.toggle('active')

        let d = document.getElementsByClassName('category')
        for (let i = 0; i < d.length; i++) {
            d[i].classList.remove('active')
        }
        document.getElementsByClassName(`cat${id}`)[0].classList.add('active')
        setState({
            ...state,
            filterCategory: id,
            filterCatName: name
        })
    }
    const openFilterBox = () => {
        document.getElementById('filterBox').classList.toggle('active')
        document.getElementsByClassName('sortBtnFixed')[0].classList.toggle('active')
    }

    return (
        <>
            <div className="wrapper">
                <div className='itemLabel'><i>Search for <b>{searchItem}</b> in {state.filterCatName}</i> </div>
                <div className="searchResultDiv">
                    <div className="sortBtnFixed" onClick={openFilterBox}>
                        <span>Sort</span>
                        <span>Close</span>
                    </div>
                    <div className="left filter" id='filterBox'>
                        <label htmlFor="">Filters</label>
                        <div className="categoryList">
                            <label htmlFor="" className="filterMain">Category</label>
                            <li className={`category cat-1 active`} onClick={() => setFilterCategory(-1, 'all')}>All</li>
                            {
                                store?.rawdata?.categories?.map(cat =>
                                    <li key={cat._id} onClick={() => setFilterCategory(cat._id, cat.categoryName)} className={`category cat${cat._id}`}>{cat.categoryName}</li>
                                )
                            }
                        </div>
                        <div className="priceRange">
                            <label htmlFor="" className="filterMain">Price</label>
                            <span>
                                <span>Min:</span>
                                <input type="text" name='minPrice' onChange={onChange} value={state.minPrice == -1 ? '' : state.minPrice} />
                            </span>
                            <span>
                                <span>Max:</span>
                                <input type="text" name='maxPrice' onChange={onChange} value={state.maxPrice == -1 ? '' : state.maxPrice} />
                            </span>
                            <div onClick={() => setFilter('price')}>GO</div>
                        </div>
                    </div>
                    <div className="right itemsResults">
                        <div className="sortingSearchItems" id="sortingSearchItems" onClick={() => document.getElementById('sortingSearchItems').classList.toggle('active')}>
                            <label htmlFor="">SORT BY: {state.sortingMethod == 1 ? 'Default' : state.sortingMethod == 2 ? 'Review' : state.sortingMethod == 3 ? 'price-low to high' : state.sortingMethod == 4 ? 'price-high to low' : null} ▼</label>
                            <ul>
                                <span onClick={() => setSorting(1)}>Default</span>
                                {/* <span onClick={()=>setSorting(2)}>Review</span> */}
                                <span onClick={() => setSorting(3)}>price-low to high</span>
                                <span onClick={() => setSorting(4)}>price-high to low</span>
                            </ul>
                        </div>
                        <div className="items">
                            {
                                listItems.length == 0 ? (
                                    <div className="noResults">
                                        <span>sorry, There is no item for this search</span>
                                    </div>
                                ) : null
                            }
                            {
                                listItems.map((item, productIndex) =>
                                    <Product
                                        key={productIndex}
                                        product={item}
                                        productIndex={productIndex}
                                    />
                                )
                            }
                        </div>
                    </div>
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
        </>
    )
}

export default Search;
