import React, { useState, useEffect } from 'react';
import { Redirect, Link, useParams, useHistory } from 'react-router-dom'
import axios from 'axios'
import { useStateValue } from '../../StateProvider/StateProvider';
import './ProductDetail.css'
import { KEYS } from '../keys'
import { isAuthUser } from '../../helpers/auth'
import { toast, ToastContainer } from 'react-toastify';
import Product from './common/Product';

function ProductDetail() {
    let history = useHistory();
    const [store, dispatch] = useStateValue();
    const { productId } = useParams()

    const [state, setState] = useState({
        suggestProductList: []
    })

    const [product, setProduct] = useState([])
    const [imgList, setImgList] = useState([])
    const [bigImg, setbigImg] = useState('')
    const [parents, setParents] = useState([])
    const [catList, setCatList] = useState([])
    const [subCatList, setSubCatList] = useState([])
    const [thisPrice, setThisPrice] = useState('')
    const [thisMrp, setThisMrp] = useState('')
    const [selectedVarient, setSelectedVarient] = useState(undefined)
    const [attries, setAttries] = useState([])
    const [sVar, setSVar] = useState([])
    const [count, setCount] = useState(0)
    const [ofs, setOFS] = useState(false)
    const [reviewList, setReviewList] = useState([])
    const [rateTotal, setRateTotal] = useState(0)
    const [rc, setRC] = useState(1)
    const [rating, setRating] = useState({
        rate: 0,
        review: ''
    })

    const getSuggestedProducts = () => {
        console.log('Loading Suggestions....')
        // fetch Suggested Products
        console.log(product)
        axios.post(`${KEYS.NODE_URL}/api/user/relatedProducts`, { productId: product._id })
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

    useEffect(() => {
        if (product.length != 0) {
            getSuggestedProducts()
        }
    }, [product])



    const getPrice = product => {
        var minPrice = product?.productVarients[0]?.general?.price
        var maxPrice = 0
        product.productVarients.map(varient => {
            if (parseFloat(varient.general.price) < minPrice) { minPrice = parseFloat(varient.general.price) }
            if (parseFloat(varient.general.price) > maxPrice) { maxPrice = parseFloat(varient.general.price) }
        })
        return (`${minPrice}-${maxPrice}`)
    }
    const getthisPrice = (product, sel) => {
        var p;
        if (sel) {
            p = parseFloat(sel.general.price)
        } else {
            p = getPrice(product)
        }
        setThisPrice(p)
    }
    const getthisMrp = (product, sel) => {
        var p = 0;
        if (sel) {
            p = parseFloat(sel.general.mrp)
        }
        setThisMrp(p)
    }
    const getImageList = (product, sel) => {
        var images = [];
        images.push(product.CoverImages[0])
        if (sel) {
            sel.general.images.map(img => images.push(img))
        }
        setImgList(images)
        if (images.length > 1) {
            setBigImg(images[1])
        }
    }
    const setSuggestList = productDtl => {
        var user = store.user
        console.log(user)
        if (user != '') {
            // suggest Product List Update
            axios.post(`${KEYS.NODE_URL}/api/user/addToSuggestionList`, { product: productDtl, userId: user.id })
                .then(result => {
                    console.log(result)
                }).catch(err => {
                    console.log(err)
                })
            // ==================
        }
    }

    useEffect(() => {
        if (productId) {
            dispatch({
                type: 'SET_LOADING'
            })
            window.scrollTo(0, 0)
            axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getAttribute`)
                .then(result => {
                    dispatch({
                        type: 'SET_ATTR',
                        data: result.data.myAttributes
                    })
                }).catch(err => {
                    console.log(err)
                })
            axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/getProductWithID`, { id: productId })
                .then(result => {
                    if (result.data.myCollection.productStatus == 0) {
                        history.push('/')
                    }
                    if ((result.data.myCollection.productType == 1) && (result.data.myCollection.productVarients.length == 0)) {
                        history.push('/')
                    }
                    console.log("im here")
                    setSuggestList(result.data.myCollection)

                    getthisPrice(result.data.myCollection, undefined)
                    getthisMrp(result.data.myCollection, undefined)
                    getImageList(result.data.myCollection, undefined)
                    if (store.rawdata.length == 0) {
                        console.log('hello.................');
                        axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getRawData`)
                            .then(results => {
                                setCatList([])
                                setSubCatList([])
                                var cList = results.data.myRawData.categories
                                var scList = results.data.myRawData.subCategories
                                var catName = ''
                                var subCatName = ''
                                cList.map(cat => {
                                    if (cat._id == result.data.myCollection.productParents.category) {
                                        catName = cat.categoryName
                                    }
                                })
                                scList.map(sc => {
                                    if (sc._id == result.data.myCollection.productParents.subCategory) {
                                        subCatName = sc.subCategoryName
                                    }
                                })
                                if (result.data.myCollection.productType == 0) {
                                    result.data.myCollection.itemQty <= 0 ? setOFS(true) : setOFS(false)
                                }
                                setProduct(result.data.myCollection)
                                let re = []
                                result.data.myCollection.productReviews.map((r, i) => i < 8 ? re.push(r) : null)
                                setReviewList(re)
                                setRateTotal(result.data.myCollection.totalRate)
                                setbigImg(result.data.myCollection.CoverImages[0])
                                setParents([catName, subCatName])
                                sorting(cList, scList)
                                dispatch({
                                    type: 'UNSET_LOADING'
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                dispatch({
                                    type: 'UNSET_LOADING'
                                })
                            })
                    } else {
                        var cList = store.rawdata.categories
                        var scList = store.rawdata.subCategories
                        var catName = ''
                        var subCatName = ''
                        cList.map(cat => {
                            if (cat._id == result.data.myCollection.productParents.category) {
                                catName = cat.categoryName
                            }
                        })
                        scList.map(sc => {
                            if (sc._id == result.data.myCollection.productParents.subCategory) {
                                subCatName = sc.subCategoryName
                            }
                        })
                        if (result.data.myCollection.productType == 0) {
                            result.data.myCollection.itemQty <= 0 ? setOFS(true) : setOFS(false)
                        }
                        let re = []
                        result.data.myCollection.productReviews.map((r, i) => i < 8 ? re.push(r) : null)
                        setReviewList(re)
                        setProduct(result.data.myCollection)
                        setRateTotal(result.data.myCollection.totalRate)
                        setbigImg(result.data.myCollection.CoverImages[0])
                        setParents([catName, subCatName])
                        setCatList(cList)
                        setSubCatList(scList)
                        dispatch({
                            type: 'UNSET_LOADING'
                        })
                    }
                }).catch(err => {
                    dispatch({
                        type: 'UNSET_LOADING'
                    })
                    console.log(err)
                })
        } else {
            history.push(`/`);
        }
    }, [])
    const setBigImg = img => {
        setbigImg(img)
    }
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

    //  varient Work management...
    const selectVarient = () => {
        var data = { ids: [], common: [] }
        var newIds = []
        sVar.length != 0 ? data.ids = sVar.ids : data.ids = []
        for (let m = 0; m < attries.length; m++) {
            for (let i = 0; i < product.productVarients.length; i++) {
                if (sVar.length != 0) {
                    if (!data.ids.includes(product.productVarients[i]._id)) {
                        continue
                    }
                }
                for (let j = 0; j < product.productVarients[i].varienteAttributes.length; j++) {
                    if (product.productVarients[i].varienteAttributes[j].attr_id == attries[m][0]) {
                        if (product.productVarients[i].varienteAttributes[j].value == attries[m][1]) {
                            newIds.push(product.productVarients[i]._id)
                        }
                    }
                }
            }
        }
        data.ids = newIds
        for (let m = 0; m < attries.length; m++) {
            for (let i = 0; i < product.productVarients.length; i++) {
                if (data.ids.includes(product.productVarients[i]._id)) {
                    for (let j = 0; j < product.productVarients[i].varienteAttributes.length; j++) {
                        let b = true
                        for (let c = 0; c < data.common.length; c++) {
                            if (data.common[c][0] == product.productVarients[i].varienteAttributes[j].attr_id) {
                                let result = data.common[c][1].includes(product.productVarients[i].varienteAttributes[j].value)
                                if (result) {
                                    b = false
                                } else {
                                    data.common[c][1].push(product.productVarients[i].varienteAttributes[j].value)
                                    b = false
                                }
                            }
                        }
                        if (b) {
                            let d = [product.productVarients[i].varienteAttributes[j].attr_id, [product.productVarients[i].varienteAttributes[j].value]]
                            data.common.push(d)
                        }
                        if (product.productVarients[i].varienteAttributes[j].attr_id != attries[m][0]) {
                        }
                    }
                }
            }
        }

        setSVar(data)
        if ((count + 1 == getVars().length) && (data.ids.length == 1)) {
            product.productVarients.map(varient => {
                if (varient._id == data.ids[0]) {
                    varient.general.itemQty <= 0 ? setOFS(true) : setOFS(false)
                    setSelectedVarient(varient)
                    getthisPrice(product, varient)
                    getthisMrp(product, varient)
                    getImageList(product, varient)
                }
            })
        }
    }

    const setSelectedAttr = (attrId, attrValue, index) => {
        var alrdy = false
        for (let i = 0; i < attries.length; i++) {
            if (attries[i][0] == attrId) {
                attries[i][1] = attrValue
                // remove all attr after that ............... happy mooment 
                attries.splice(i + 1)
                alrdy = true
            }
        }
        if (!alrdy) {
            var attry = [attrId, attrValue]
            attries.push(attry)
            if (attries.length > 1) {
                attries.splice(0, attries.length - 1)
            }
        }
        setAttries(attries)
        setCount(count + 1)
        selectVarient()


        let obj = document.getElementsByClassName(`atr${attrId}${product._id}`)
        for (let i = 0; i < obj.length; i++) {
            obj[i].classList.remove('active')
        }
        document.getElementById(`atr${index}${product._id}${attrId}`).classList.add('active')
    }

    const getAtr = (a, atr, index) => {
        if ((sVar.length != 0)) {
            for (let i = 0; i < sVar.common.length; i++) {
                if (sVar.common[i][0] == a.id) {
                    for (let j = 0; j < sVar.common[i][1].length; j++) {
                        if (atr == sVar.common[i][1][j]) {
                            return (<li key={index} className={`atr${product._id} atr${a.id}${product._id}`} id={`atr${index}${product._id}${a.id}`} onClick={() => setSelectedAttr(a.id, atr, index)}>{atr}</li>)
                        }
                    }
                    return (<li className={`atr${product._id} atr${a.id}${product._id} disabled`} key={index} onClick={() => setSelectedAttr(a.id, atr)}>{atr}</li>)
                }
            }
        } else {
            return (<li key={index} className={`atr${product._id} atr${a.id}${product._id}`} id={`atr${index}${product._id}${a.id}`} onClick={() => setSelectedAttr(a.id, atr, index)}>{atr}</li>)
        }
    }

    const getVars = () => {
        var a = []
        var stat = true
        for (let i = 0; i < product.productVarients.length; i++) {
            for (let j = 0; j < product.productVarients[i].varienteAttributes.length; j++) {
                for (let k = 0; k < a.length; k++) {
                    if (a[k].id == product.productVarients[i].varienteAttributes[j].attr_id) {
                        var alrdy = a[k].values.includes(product.productVarients[i].varienteAttributes[j].value)
                        if (alrdy) {
                            stat = false
                        } else {
                            a[k].values.push(product.productVarients[i].varienteAttributes[j].value)
                            stat = false
                        }
                    }
                }
                if (stat) {
                    var value = [
                        product.productVarients[i].varienteAttributes[j].value
                    ]
                    a.push({
                        id: product.productVarients[i].varienteAttributes[j].attr_id,
                        values: value
                    })
                }
            }
        }
        return a
    }

    const clearVars = () => {
        setOFS(false)
        setSVar([])
        setAttries([])
        setCount(0)
        setSelectedVarient(undefined)
        let obj = document.getElementsByClassName(`atr${product._id}`)
        for (let i = 0; i < obj.length; i++) {
            obj[i].classList.remove('active')
        }
        getthisPrice(product, undefined)
        getthisMrp(product, undefined)
        getImageList(product, undefined)
        setBigImg(product.CoverImages[0])
    }

    const toggleProductDtl = () => {
        document.getElementsByClassName('productDetail')[0].classList.toggle('active')
        document.getElementsByClassName('_ad')[0].classList.toggle('active')
        document.getElementsByClassName('_ac')[0].classList.toggle('active')
    }

    const cartBtnAnimation = () => {
        // animation on cartBoxBtn
        document.getElementsByClassName('cartBox')[0].classList.add('animate')

        setTimeout(function () {
            document.getElementsByClassName('cartBox')[0].classList.remove('animate')
        }, 2000);
        // ===================
    }

    const addToCart = () => {
        document.getElementById('addToCartProductDtlBtn').disabled = true
        document.getElementById('shortLoading').style.display = 'block'

        if (product.productType == 1) {
            let stat = true
            store.cart.map(i => i.id == product._id && i.varient._id == selectedVarient?._id ? stat = false : null)
            if (!stat) {
                toast.error('Item Already in Cart')
                document.getElementById('addToCartProductDtlBtn').disabled = false
                document.getElementById('shortLoading').style.display = 'none'
                return
            }
            var item = {
                userId: store.user.id,
                item: {
                    id: product._id,
                    name: product.productName,
                    itemQty: 1,
                    coverImg: product.CoverImages[0],
                    productType: product.productType,
                    varient: selectedVarient
                }
            }
        } else if (product.productType == 0) {
            let stat = true
            store.cart.map(i => i.id == product._id ? stat = false : null)
            if (!stat) {
                toast.error('Item Already in Cart')
                document.getElementById('shortLoading').style.display = 'none'
                document.getElementById('addToCartProductDtlBtn').disabled = false
                return
            }
            var item = {
                userId: '',
                item: {
                    id: product._id,
                    name: product.productName,
                    itemQty: 1,
                    coverImg: product.CoverImages.length != 0 ? product.CoverImages[0] : 'data:image/png;base64,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',
                    productType: product.productType,
                    price: product.productPricing,
                }
            }
        } else {
            document.getElementById('shortLoading').style.display = 'none'
            document.getElementById('addToCartProductDtlBtn').disabled = false
            alert('something went wrong... (: ')
        }

        if (store.user == '') {
            document.getElementById('signup').classList.add('open')
            dispatch({
                type: 'CART_PENDING',
                item
            })
            document.getElementById('shortLoading').style.display = 'none'
            document.getElementById('addToCartProductDtlBtn').disabled = false
            return
        } else {
            item.userId = store.user.id
        }

        axios.post(`${KEYS.NODE_URL}/api/user/cart/156/add`, item).then(result => {
            dispatch({
                type: 'ADD_TO_CART',
                item: item.item
            })
            cartBtnAnimation()
            toast.success('Added To Cart')

            document.getElementById('shortLoading').style.display = 'none'
            document.getElementById('addToCartProductDtlBtn').disabled = false
        }).catch(err => {
            toast.error('Something wrong')
            document.getElementById('shortLoading').style.display = 'none'
            document.getElementById('addToCartProductDtlBtn').disabled = false
        })
    }

    const rateNow = () => {
        if (store.user == '') {
            toast.error('First login please')
            return
        }
        axios.post(`${KEYS.NODE_URL}/api/user/auth/156/ratingCheckProduct`, { product, userId: store.user.id }).then(result => {
            document.getElementsByClassName('ratingNowDiv')[0].classList.toggle('active')
        }).catch(err => {
            console.log(err.response)
            if (err?.response?.data?.error) {
                toast.error(err?.response?.data.error)
            } else {
                toast.error('Something wrong')
            }
        })
    }
    const submitRatingNow = () => {
        axios.post(`${KEYS.NODE_URL}/api/user/auth/156/setRating`, { product, userId: store.user.id, rating }).then(result => {
            toast.success(result.data.message)
            document.getElementsByClassName('ratingNowDiv')[0].classList.remove('active')
            const newReview = {
                userId: store.user.name,
                rate: parseFloat(rating.rate),
                review: rating.review
            }
            setReviewList([newReview, ...reviewList])
            setRateTotal(rateTotal + parseFloat(rating.rate))
            setRating({
                ...rating,
                rate: 0,
                review: '',
            })
        }).catch(err => {
            console.log(err.response)
            if (err?.response?.data?.error) {
                toast.error(err?.response?.data.error)
            } else {
                toast.error('Something wrong')
            }
        })
    }

    const getMoreReview = () => {
        let prev = [...reviewList]
        let newR = product.productReviews.splice(rc * 8, 8)
        prev = [...prev, ...newR]
        setReviewList(prev)
        setRC(rc + 1);
    }

    return (
        <>
            <div className="wrapper">
                <ToastContainer
                    position="bottom-right"
                />

                {
                    store.loading ? (
                        <div className="loadingContainer">
                            <img src="https://motiongraphicsphoebe.files.wordpress.com/2018/10/giphy.gif" alt="Loading..." />
                        </div>
                    ) : (
                        <>
                            <div className="productDtl">
                                <div className="box images">
                                    <div className="imagesDtl">
                                        <div className="list">
                                            {
                                                product.productType == 1 && imgList.length == 0 ? (
                                                    <>
                                                    </>
                                                ) : product.productType == 1 && imgList.length != 0 ? (
                                                    imgList.map((img, k) => (
                                                        <img onMouseEnter={() => setBigImg(img)} onClick={() => setBigImg(img)} key={k} src={img} />
                                                    ))
                                                ) : product.productType == 0 ? (
                                                    <>
                                                        <img onMouseEnter={() => setBigImg(product.CoverImages[0])} onClick={() => setBigImg(product.CoverImages[0])} src={product.CoverImages[0]} />
                                                        {
                                                            product.productImages.map((img, k) => (
                                                                <img key={k} src={img} onMouseEnter={() => setBigImg(img)} onClick={() => setBigImg(img)} />
                                                            ))
                                                        }
                                                    </>
                                                ) : null
                                            }
                                        </div>
                                        <div className="bigImg">
                                            <div className="addToWishList">
                                                <i></i>
                                            </div>
                                            <img src={bigImg} alt="bigImg" />
                                        </div>
                                    </div>
                                    <div className={`buttons ${(selectedVarient == undefined && product.productType == 1) || ofs ? 'disabled' : ''}`}>
                                        <button id='addToCartProductDtlBtn' onClick={() => addToCart()}>Add to cart</button>
                                        {/* <button>Buy now</button> */}
                                    </div>
                                </div>
                                <div className="box details">
                                    <div className="department">
                                        {parents[0]} &#x27A4; {parents[1]}
                                    </div>
                                    <div className="name">
                                        <span>
                                            <span>{product.productName}</span>
                                            {
                                                selectedVarient ? (
                                                    <span className='attributes'>{selectedVarient.varienteAttributes.map((atr, index) => index == 0 && index + 1 == selectedVarient.varienteAttributes.length ? (<span key={index}>({atr.value})</span>) : index == 0 ? (<span key={index}>({atr.value},</span>) : index + 1 == selectedVarient.varienteAttributes.length ? (<span key={index}>{atr.value})</span>) : (<span key={index}>{atr.value},</span>))} </span>
                                                ) : null
                                            }
                                        </span>
                                        <span className='shortDisc'>{product.ProductShortDisc}</span>
                                    </div>
                                    {
                                        product.productType == 0 ? (
                                            <div className="pricing">
                                                {
                                                    ofs ?
                                                        <span className="ofs">out of stock</span> :
                                                        <>
                                                            {product.productPricing?.price} ₹<span>{product.productPricing?.mrp} ₹</span>
                                                            <span className="off">{((product.productPricing?.mrp - product.productPricing?.price) * 100 / product.productPricing?.mrp).toFixed(0)}% off</span>
                                                        </>
                                                }
                                            </div>
                                        ) : product.productType == 1 ? (
                                            <div className="pricing">
                                                {
                                                    ofs ?
                                                        <span className="ofs">out of stock</span> :
                                                        <>
                                                            <span className='minMax'>{thisPrice} ₹</span>
                                                            {
                                                                selectedVarient ? (
                                                                    <>
                                                                        <span className='mrp'>{thisMrp}₹</span>
                                                                        <span className='off'>{((thisMrp - thisPrice) * 100 / thisMrp).toFixed(0)} % Off</span>
                                                                    </>
                                                                ) : null
                                                            }
                                                        </>
                                                }
                                            </div>
                                        ) : null
                                    }
                                    <div className="varients">
                                        {
                                            product.productType == 1 ? (
                                                <>
                                                    {
                                                        attries.length != 0 ? (
                                                            <span className='clear a' onClick={clearVars}>Clear</span>
                                                        ) : (
                                                            <span className='clear' onClick={clearVars}>Clear</span>
                                                        )
                                                    }
                                                    {
                                                        getVars().map(a => (
                                                            <div key={a.id} className="rowAttrs">
                                                                <label htmlFor="">{
                                                                    store.attributes.map(atrDefault => {
                                                                        return atrDefault._id == a.id ? atrDefault.attribute : ''
                                                                    })
                                                                }</label>
                                                                <ul>
                                                                    {a.values.map((atr, index) => (
                                                                        getAtr(a, atr, index)
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))
                                                    }
                                                </>
                                            ) : null
                                        }
                                    </div>
                                    <div className="productDtlDiv">
                                        <label onClick={toggleProductDtl}><span>Product Details</span> <span className='_ad active'>+</span> <span className='_ac'>-</span></label>
                                        <div className="productDetail">
                                            {
                                                product.productType == 0 ? (
                                                    product.simpleDtl.map(dtl => <li><span>{dtl[0]}</span><span>{dtl[1]}</span></li>)
                                                ) : product.productType == 1 ? (
                                                    selectedVarient ? selectedVarient.varDtl.map(dtl => <li><span>{dtl[0]}</span><span>{dtl[1]}</span></li>) : <li className='sV'>Please Select Any one Variation of Product</li>
                                                ) : null
                                            }
                                        </div>
                                    </div>
                                    <div className="productDisc">
                                        <div className="discription">
                                            {
                                                product?.productDisc != '' ? (
                                                    <span>Discription</span>
                                                ) : null
                                            }
                                            {product.productDisc}
                                        </div>
                                    </div>
                                    <div className="ratingReview">
                                        <label>
                                            <span>Rating & Reviews</span>
                                            <span>
                                                <span className='rate A'>{parseFloat(rateTotal) == 0 ? '0 ' : (parseFloat(rateTotal) / parseFloat(reviewList.length)).toFixed(1)}&#9733;</span>
                                                <span>{parseFloat(reviewList.length)} Review & Rating</span>
                                            </span>
                                            <span onClick={rateNow}>Rate</span>
                                        </label>
                                        <div className="ratingNowDiv">
                                            <span>
                                                <span><b>Rate:</b> &nbsp;</span>
                                                <select name="" id="" defaultValue={rating.rate} onChange={(e) => setRating({ ...rating, ['rate']: e.target.value })}>
                                                    <option value="0.0">0.0</option>
                                                    <option value="0.5">0.5</option>
                                                    <option value="1.0">1.0</option>
                                                    <option value="1.5">1.5</option>
                                                    <option value="2.0">2.0</option>
                                                    <option value="2.5">2.5</option>
                                                    <option value="3.0">3.0</option>
                                                    <option value="3.5">3.5</option>
                                                    <option value="4.0">4.0</option>
                                                    <option value="4.5">4.5</option>
                                                    <option value="5.0">5.0</option>
                                                </select>
                                            </span>
                                            <textarea value={rating.review} onChange={(e) => setRating({ ...rating, ['review']: e.target.value })} placeholder='whats your review...' type="text" name="" id="" />
                                            <button onClick={submitRatingNow} className='btn update'>Submit</button>
                                        </div>
                                        {/* <div className="allImages">
                                            <label>Images uploaded by customers:</label>
                                            <div className="imgs">
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                                <img src="" alt="" />
                                            </div>
                                        </div> */}
                                        <div className="allReviews" id='allReviews'>
                                            {console.log('revv', reviewList)}
                                            {
                                                reviewList.map((r, index) => (
                                                    <div className="review">
                                                        <span>
                                                            <span className="rate A">{r.rate}&#9733;</span>
                                                            <span className="text">{r.review}</span>
                                                        </span>
                                                        <span>{r.userId}</span>
                                                    </div>
                                                ))
                                            }
                                            {
                                                product?.productReviews?.length > rc * 8 ? <div className="bottom" onClick={getMoreReview}>More Reviews</div> : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id='SuggestedProducts'>
                                {
                                    state.suggestProductList.length == 0 ? null :
                                        <div className="row-slider a aa">
                                            <div className="header">
                                                <div className="label">{store.user.name}, See Similar Products</div>
                                                {/* <div className="right">
                                                    <button onClick={() => alert('view all in pending')}>view all</button>
                                                </div> */}
                                            </div>
                                            <div className="items">
                                                {
                                                    state.suggestProductList.map((productt, productIndex) => {
                                                        return ((productt.productPricing == undefined || productt.productPricing.price == "") && (productt.productType == 0) || (productt.productStatus == 0)) ? null : (
                                                            <Product
                                                                key={productIndex}
                                                                product={productt}
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
                        </>
                    )
                }
            </div>
        </>
    );
}

export default ProductDetail;
