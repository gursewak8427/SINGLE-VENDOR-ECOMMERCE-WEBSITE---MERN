import React, { useEffect, useState } from 'react';
import { Redirect, Link, useParams } from 'react-router-dom'
import axios from 'axios'
import ImageUploader from 'react-images-upload'
import { ToastContainer, toast } from 'react-toastify'
import { getTokenAdmin } from '../../../helpers/auth';

import './AddVarient.css'
import { KEYS } from '../../keys';
import { useStateValue } from '../../../StateProvider/StateProvider';

function AddVarient({ stateChanger, finalCat, finalSubCat, finalProduct, ...rest }) {
    const [store, dispatch] = useStateValue();
    const [state, setState] = useState({
        finalProduct: finalProduct,
        productType: 0,
        attributes: [],
        varients: [],
        varientList: [],
        pictures: [],
        ppictures: [],
        CoverPictures: [],
        picUrls: [],
        varPrices: [],
        varItemQty: [],
        varMrps: [],
        simplePrice: '',
        simpleMrp: '',
        simpleQty: '',
        coverImagesList: [],

        // product-detail
        productName: '',
        productBrand: '',
        productShortDisc: '',
        productDisc: '',
        productkeywords: '',
        productStatus: 0,
        simpleImageList: [],

        simpleDtl: [],
        simpleDtlKey: '',
        simpleDtlValue: '',

        varDtl: [],
        varDtlKey: [],
        varDtlValue: [],

        tempSelectedVarients: [],
        selectedVarients: [],
    })
    const { id } = useParams()
    useEffect(() => {
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/getSelectedVarients`, { pId: state.finalProduct[0] })
            .then(r => {
                state.selectedVarients = []
                r.data.selectedVarients.map(obj => {
                    state.selectedVarients.push(obj)
                    state.tempSelectedVarients.push(obj)
                })
            })
            .catch(err => console.log(err))
        setState({
            ...state,
            tempSelectedVarients: state.tempSelectedVarients,
            selectedVarients: state.selectedVarients
        })
    }, [])
    useEffect(() => {
        window.scroll(0, 0)
        dispatch({
            type: 'SET_LOADING'
        })
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/getProduct?p_id=${state.finalProduct[0]}`,  {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getAttribute`,  {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `barear ${getTokenAdmin()}`
                      }
                })
                    .then(resultAttr => {
                        state.varPrices = []
                        state.varMrps = []
                        result.data.myProduct.productVarients.map(obj => {
                            state.varPrices.push(obj.general.price)
                        })
                        result.data.myProduct.productVarients.map(obj => {
                            state.varMrps.push(obj.general.mrp)
                        })
                        state.coverImagesList = []
                        result.data.myProduct.CoverImages.map(img => {
                            state.coverImagesList.push(img)
                        })
                        state.simpleDtl = []
                        result.data.myProduct?.simpleDtl.map(dtl => {
                            state.simpleDtl.push(dtl)
                        })
                        state.varDtl = []
                        result.data.myProduct.productVarients.map(varient => {
                            state.varDtl.push(varient.varDtl)
                            state.varDtlKey.push('')
                            state.varDtlValue.push('')
                        })
                        state.varItemQty = []
                        result.data.myProduct.productVarients.map(obj => {
                            state.varItemQty.push(obj.general.itemQty)
                        })
                        // console.log('varDtl',state.varDtl)
                        if (id) {
                            setState({
                                ...state,
                                productName: result.data.myProduct.productName,
                                productBrand: result.data.myProduct.productBrand,
                                productShortDisc: result.data.myProduct.ProductShortDisc,
                                productDisc: result.data.myProduct.productDisc,
                                productkeywords: result.data.myProduct.productKeywords,
                                productStatus: result.data.myProduct.productStatus,

                                attributes: resultAttr.data.myAttributes,
                                varients: [],

                                varPrices: [],
                                varItemQty: [],
                                varMrps: [],

                                varPrices: state.varPrices,
                                varItemQty: state.varItemQty,
                                varMrps: state.varMrps,

                                coverImagesList: state.coverImagesList,
                                varientList: result.data.myProduct.productVarients,
                                productType: result.data.myProduct.productType,
                                simplePrice: result.data.myProduct?.productPricing?.price,
                                simpleMrp: result.data.myProduct?.productPricing?.mrp,
                                simpleImageList: result.data.myProduct.productImages,
                                simpleQty: result.data.myProduct?.itemQty,

                                simpleDtl: state.simpleDtl,
                                varDtl: state.varDtl,
                                varDtlKey: state.varDtlKey,
                                varDtlValue: state.varDtlValue,
                            })
                            result.data.myProduct.productStatus == 1 ? (
                                document.getElementById('proActiveStat').checked = true
                            ) : result.data.myProduct.productStatus == 0 ? (
                                document.getElementById('proDeactiveStat').checked = true
                            ) : (
                                document.getElementById('proDeactiveStat').checked = true
                            )
                        } else {
                            setState({
                                ...state,
                                attributes: resultAttr.data.myAttributes,
                            })
                        }
                        dispatch({
                            type: 'UNSET_LOADING'
                        })
                    }).catch(err => {
                        dispatch({
                            type: 'UNSET_LOADING'
                        })
                        console.log(err)
                    })
            }).catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log(err)
            })
    }, [])
    const onChange = (e) => {
        dispatch({
            type: 'SET_LOADING'
        })
        if (e.target.name == "productType") {
            axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/updateProductType?p_id=${state.finalProduct[0]}`, { 'pt': e.target.value },
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
                }).catch(err => {
                    dispatch({
                        type: 'UNSET_LOADING'
                    })
                    console.log(err)
                })
        }
        dispatch({
            type: 'UNSET_LOADING'
        })
        var d = []
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/getSelectedVarients`, { pId: state.finalProduct[0] },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(results => {
                d = results.data.selectedVarients
            })
            .catch(err => console.log(err))
        setState({
            ...state,
            setSelectedVarients: d,
            [e.target.name]: e.target.value
        })
    }
    const setAttr = (e, id) => {
        let new_value = e.target.value
        if (state.varients.length == 0) {
            if (new_value == "") {
                return
            }
            let new_attr = {
                attr_id: id,
                value: new_value
            }
            state.varients.push(new_attr)
            setState({ ...state, varients: state.varients })
            return
        }
        let i = 0
        var status = true
        while (i < state.varients.length) {
            if (state.varients[i].attr_id == id) {
                if (new_value == "") {
                    state.varients.splice(i, 1);
                    return
                }
                state.varients[i].value = new_value
                setState({ ...state, varients: state.varients })
                status = false
                return
            }
            i += 1
        }
        if (status) {
            if (new_value == "") {
                return
            }
            let new_attr = {
                attr_id: id,
                value: new_value
            }
            state.varients.push(new_attr)
            setState({ ...state, varients: state.varients })
        }
    }
    const makeVarient = () => {
        if (state.varients.length == 0) {
            toast.error('please select atleast one attribute of variation . . .')
            // alert('please select atleast one attribute of variation . . .')
            return
        }
        if (state.varients.length != state.selectedVarients.length) {
            toast.error(`please select all variation( exact ${state.selectedVarients.length} )`)
            // alert(`please select all variation( exact ${state.selectedVarients.length} )`)
            return
        }
        dispatch({
            type: 'SET_LOADING'
        })
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/insertProductVarient?p_id=${state.finalProduct[0]}`, { varients: state.varients },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                setState({
                    ...state,
                    varients: [],
                    varPrices: [],
                    varItemQty: [],
                    varMrps: []
                });
                state.varDtl = []
                result.data.myVarients.map(varient => {
                    state.varDtl.push(varient.varDtl)
                    state.varDtlKey.push('')
                    state.varDtlValue.push('')
                })
                state.varPrices = []
                result.data.myVarients.map(obj => {
                    state.varPrices.push(obj.general.price)
                })
                state.varItemQty = []
                result.data.myVarients.map(obj => {
                    state.varItemQty.push(obj.general.itemQty)
                })
                state.varMrps = []
                result.data.myVarients.map(obj => {
                    state.varMrps.push(obj.general.mrp)
                })
                setState({ ...state, varPrices: state.varPrices, varItemQty: state.varItemQty, varMrps: state.varMrps, varientList: result.data.myVarients, varDtl: state.varDtl })
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
    const getAttrName = (id) => {
        for (let i = 0; i < state.attributes.length; i += 1) {
            if (state.attributes[i]._id == id) {
                return state.attributes[i].attribute
            }
        }
    }
    const openGeneral = (id) => {
        document.getElementsByClassName(id)[0].classList.toggle('open')
    }

    const onDrop = picture => {
        setState({
            ...state,
            pictures: picture
        });
    }
    const onImgDrop = picture => {
        setState({
            ...state,
            ppictures: picture
        });
    }
    const onCoverDrop = picture => {
        setState({
            ...state,
            CoverPictures: picture
        });
    }
    const updateVar = (var_id, indexx) => {
        dispatch({
            type: 'SET_LOADING'
        })
        let uploadPromises = state.pictures.map(image => {
            let data = new FormData();
            data.append('file', image);
            data.append('upload_preset', 'eshoppyzone');
            data.append('cloud_name', 'mycloud8427');
            return axios.post(`https://api.cloudinary.com/v1_1/mycloud8427/image/upload/`, data)
        })
        axios.all(uploadPromises)
            .then(results => {
                state.picUrls = []
                results.map(img => {
                    state.picUrls.push(img.data.url)
                    setState({
                        ...state,
                        picUrls: state.picUrls,
                    })
                })
                let data = {
                    "price": state.varPrices[indexx],
                    "varItemQty": state.varItemQty[indexx],
                    "mrp": state.varMrps[indexx],
                    "images": state.picUrls,
                    "pt": state.productType,
                    "varDtl": state.varDtl[indexx]
                }
                axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/updateProductVarient?p_id=${state.finalProduct[0]}&var_id=${var_id}`, data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `barear ${getTokenAdmin()}`
                      }
                })
                    .then(result => {
                        state.pictures = []
                        setState({
                            ...state,
                            pictures: state.pictures,
                            picUrls: [],
                            varPrices: [],
                            varItemQty: [],
                            varMrps: [],
                            varientList: [],
                        });
                        state.varPrices = []
                        result.data.myVarients.map(obj => {
                            state.varPrices.push(obj.general.price)
                        })
                        state.varItemQty = []
                        result.data.myVarients.map(obj => {
                            state.varItemQty.push(obj.general.itemQty)
                        })
                        state.varMrps = []
                        result.data.myVarients.map(obj => {
                            state.varMrps.push(obj.general.mrp)
                        })
                        setState({ ...state, varPrices: state.varPrices, varMrps: state.varMrps, varientList: result.data.myVarients })
                        toast.success('Update successfully')
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
            })
            .catch(e => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log('error', e)
            })
    }
    const onPriceChange = (e, index) => {
        state.varPrices[index] = e.target.value
        setState({ ...state, varPrice: state.varPrices });
    }
    const onItemQtyChange = (e, index) => {
        state.varItemQty[index] = e.target.value
        setState({ ...state, varItemQty: state.varItemQty });
    }
    const onMrpChange = (e, index) => {
        state.varMrps[index] = e.target.value
        setState({ ...state, varMrps: state.varMrps });
    }
    const saveSimpleProduct = () => {
        dispatch({
            type: 'SET_LOADING'
        })
        let uploadPromises = state.ppictures.map(image => {
            let data = new FormData();
            data.append('file', image);
            data.append('upload_preset', 'eshoppyzone');
            data.append('cloud_name', 'mycloud8427');
            return axios.post(`https://api.cloudinary.com/v1_1/mycloud8427/image/upload/`, data)
        })
        axios.all(uploadPromises)
            .then(results => {
                state.picUrls = []
                results.map(img => {
                    state.picUrls.push(img.data.url)
                    setState({
                        ...state,
                        picUrls: state.picUrls,
                    })
                })
                let data = {
                    "price": state.simplePrice,
                    "mrp": state.simpleMrp,
                    'pt': state.productType, // pt = product Type :)
                    "images": state.picUrls,
                    "simpleDtl": state.simpleDtl,
                    "simpleQty": state.simpleQty
                }
                axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/updateProductVarient?p_id=${state.finalProduct[0]}`, data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `barear ${getTokenAdmin()}`
                      }
                })
                    .then(result => {
                        state.simpleDtl = []
                        result.data.myProduct?.simpleDtl.map(dtl => {
                            state.simpleDtl.push(dtl)
                        })
                        setState({
                            ...state,
                            simplePrice: result.data.myProduct.productPricing.price,
                            simpleMrp: result.data.myProduct.productPricing.mrp,
                            simpleImageList: result.data.myProduct.productImages,
                            picUrls: [],
                            simpleDtl: state.simpleDtl
                        });
                        dispatch({
                            type: 'UNSET_LOADING'
                        })
                        toast.success('saved')
                        // alert('saved')
                    })
                    .catch(err => {
                        dispatch({
                            type: 'UNSET_LOADING'
                        })
                        console.log(err)
                    })
            })
            .catch(err => {
                dispatch({
                    type: 'UNSET_LOADING'
                })
                console.log(err)
            })
    }
    const uploadCoverImages = () => {
        if (state.CoverPictures.length == 0) {
            toast.error('plz select atleast one image')
            // alert('plz select atleast one image')
            return
        }
        dispatch({
            type: 'SET_LOADING'
        })
        let uploadPromises = state.CoverPictures.map(image => {
            let data = new FormData();
            data.append('file', image);
            data.append('upload_preset', 'eshoppyzone');
            data.append('cloud_name', 'mycloud8427');
            return axios.post(`https://api.cloudinary.com/v1_1/mycloud8427/image/upload/`, data)
        })
        axios.all(uploadPromises)
            .then(results => {
                state.picUrls = []
                results.map(img => {
                    state.picUrls.push(img.data.url)
                    setState({
                        ...state,
                        picUrls: state.picUrls,
                    })
                })
                let data = {
                    "images": state.picUrls,
                }
                axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/updateCoverImages?p_id=${state.finalProduct[0]}`, data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `barear ${getTokenAdmin()}`
                      }
                })
                    .then(result => {
                        state.CoverPictures = []
                        state.coverImagesList = []
                        state.picUrls = []
                        result.data.myProduct.CoverImages.map(img => {
                            state.coverImagesList.push(img)
                        })
                        setState({
                            ...state,
                            CoverPictures: state.CoverPictures,
                            coverImagesList: state.coverImagesList
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
            })
            .catch(e => {
                console.log('error', e)
                dispatch({
                    type: 'UNSET_LOADING'
                })
            })
    }
    const onUpdate = () => {
        dispatch({
            type: 'SET_LOADING'
        })
        var myProduct = {
            "_id": state.finalProduct[0],
            "parents": {
                "category": finalCat[0],
                "subCategory": finalSubCat[0]
            },
            "productName": state.productName,
            "productBrand": state.productBrand,
            "productShortDisc": state.productShortDisc,
            "productDisc": state.productDisc,
            "productKeywords": state.productkeywords,
            "productStatus": state.productStatus,
        }
        // upload product and get product id
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/updateProduct`, { myProduct },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                setState({
                    ...state,
                    productName: result.data.product.productName,
                    productBrand: result.data.product.productBrand,
                    productShortDisc: result.data.product.productShortDisc,
                    productDisc: result.data.product.productDisc,
                    productkeywords: result.data.product.productKeywords,
                    productStatus: result.data.product.productStatus,
                    finalProduct: [result.data.product._id, result.data.product.productName]
                })
                toast.success('update Successfully')
                // alert('update Successfully')
                dispatch({
                    type: 'UNSET_LOADING'
                })
            })
            .catch(err => {
                console.log(err)
            })
    }
    const deleteVarImage = (pId, varId, imgId) => {
        dispatch({
            type: 'SET_LOADING'
        })
        let data = { pId, varId, imgId }
        // upload product and get product id
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/deleteVarImage`, data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                setState({
                    ...state,
                    varPrices: [],
                    varItemQty: [],
                    varMrps: [],
                    varientList: [],
                });
                state.varPrices = []
                result.data.myProduct.productVarients.map(obj => {
                    state.varPrices.push(obj.general.price)
                })
                state.varItemQty = []
                result.data.myProduct.productVarients.map(obj => {
                    state.varItemQty.push(obj.general.itemQty)
                })
                state.varMrps = []
                result.data.myProduct.productVarients.map(obj => {
                    state.varMrps.push(obj.general.price)
                })
                setState({ ...state, varPrices: state.varPrices, varItemQty: state.varItemQty, varMrps: state.varMrps, varientList: result.data.myProduct.productVarients })
                dispatch({
                    type: 'UNSET_LOADING'
                })
            })
            .catch(err => {
                console.log(err)
            })
    }
    const deleteSimpleImage = (pId, imgId) => {
        dispatch({
            type: 'SET_LOADING'
        })
        let data = { pId, imgId }
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/deleteSimpleImage`, data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                setState({
                    ...state,
                    simpleImageList: result.data.myProduct.productImages
                });
                dispatch({
                    type: 'UNSET_LOADING'
                })
            })
            .catch(err => {
                console.log(err)
            })
    }
    const addSimpleDtl = () => {
        if (state.simpleDtlKey == '' || state.simpleDtlValue == '') {
            // alert('All fields are required')
            toast.error('All fields are required')
            return
        }
        dispatch({
            type: 'SET_LOADING'
        })
        let data = [state.simpleDtlKey, state.simpleDtlValue]
        state.simpleDtl.push(data)
        console.log(state.simpleDtl)
        setState({ ...state, simpleDtl: state.simpleDtl, simpleDtlKey: '', simpleDtlValue: '' })
        dispatch({
            type: 'UNSET_LOADING'
        })
    }
    const deleteSimpleDtl = index => {
        dispatch({
            type: 'SET_LOADING'
        })
        state.simpleDtl.splice(index, 1)
        setState({ ...state, simpleDtl: state.simpleDtl })
        dispatch({
            type: 'UNSET_LOADING'
        })
    }

    const addVarDtl = (index) => {
        if (state.varDtlKey[index] == "" || state.varDtlValue[index] == "") {
            toast.error('All Fields are required')
            // alert('All Fields are required')
            return
        }
        dispatch({
            type: 'SET_LOADING'
        })
        let data = [state.varDtlKey[index], state.varDtlValue[index]]
        state.varDtl[index].push(data)
        state.varDtlKey[index] = ''
        state.varDtlValue[index] = ''
        setState({ ...state, varDtl: state.varDtl, varDtlKey: state.varDtlKey, varDtlValue: state.varDtlValue })
        dispatch({
            type: 'UNSET_LOADING'
        })
    }
    const deleteVarDtl = (index, id) => {
        dispatch({
            type: 'SET_LOADING'
        })
        state.varDtl[index].splice(id, 1)
        setState({ ...state, varDtl: state.varDtl })
        dispatch({
            type: 'UNSET_LOADING'
        })
    }
    const onVarDtlKeyChange = (e, index) => {
        state.varDtlKey[index] = e.target.value
        setState({ ...state, varDtlKey: state.varDtlKey })
    }
    const onVarDtlValueChange = (e, index) => {
        state.varDtlValue[index] = e.target.value
        setState({ ...state, varDtlValue: state.varDtlValue })
    }
    const deleteVar = (varId, indexx) => {
        dispatch({
            type: 'SET_LOADING'
        })
        let data = { pId: finalProduct[0], varId, indexx }
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/deleteVar`, data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                setState({
                    ...state,
                    varPrices: [],
                    varItemQty: [],
                    varMrps: [],
                    varientList: [],
                });
                state.varPrices = []
                result.data.myProduct.productVarients.map(obj => {
                    state.varPrices.push(obj.general.price)
                })
                state.varItemQty = []
                result.data.myProduct.productVarients.map(obj => {
                    state.varItemQty.push(obj.general.itemQty)
                })
                state.varMrps = []
                result.data.myProduct.productVarients.map(obj => {
                    state.varMrps.push(obj.general.price)
                })
                setState({ ...state, varPrices: state.varPrices, varItemQty: state.varItemQty, varMrps: state.varMrps, varientList: result.data.myProduct.productVarients })
                dispatch({
                    type: 'UNSET_LOADING'
                })
            })
            .catch(err => console.log(err))
    }
    const setSelectedVarients = (id) => {
        dispatch({
            type: 'SET_LOADING'
        })
        let yes = 'abccc'
        state.tempSelectedVarients.map((i, index) => i == id ? yes = index : null)
        if (yes == 'abccc') {
            state.tempSelectedVarients = [...state.tempSelectedVarients, id]
            setState({
                ...state,
                tempSelectedVarients: state.tempSelectedVarients
            })
        } else {
            let d = state.tempSelectedVarients
            d.splice(yes, 1)
            state.tempSelectedVarients = []
            d.map(i => state.tempSelectedVarients.push(i))
            setState({
                ...state,
                tempSelectedVarients: state.tempSelectedVarients
            })
        }
        dispatch({
            type: 'UNSET_LOADING'
        })
    }
    const saveSelectedVar = () => {
        state.selectedVarients = []
        var d = []
        state.tempSelectedVarients.map(i => d.push(i))
        setState({
            ...state,
            selectedVarients: d
        })
        let data = {
            pId: state.finalProduct[0],
            selectedVarients: d
        }
        axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/setSelectedVarients`, data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                document.getElementsByClassName('popupSelectedVarients')[0].classList.remove('active')
            })
            .catch(err => console.log(err))
    }
    const cancelSelectedVar = () => {
        document.getElementsByClassName('popupSelectedVarients')[0].classList.remove('active')
        setState({
            ...state,
            tempSelectedVarients: state.selectedVarients
        })
    }
    return (
        <>
            <ToastContainer />
            <h1 className="product_for">{finalCat[1]} / {finalSubCat[1]} / {state.finalProduct[1]}</h1>
            {
                id ? (
                    <div className="form-product form-general">
                        <label htmlFor="productName">[ General details ]</label>
                        <div className="form-area">
                            <label htmlFor="productName">Product Name</label>
                            <input type="text" name="productName" id="productName" value={state.productName} onChange={onChange} />
                        </div>
                        <div className="form-area">
                            <label htmlFor="productBrand">Product Brand</label>
                            <input type="text" name="productBrand" id="productBrand" value={state.productBrand} onChange={onChange} />
                        </div>
                        <div className="form-area">
                            <label htmlFor="productShortDisc">Product Short Discription</label>
                            <input type="text" name="productShortDisc" id="productShortDisc" value={state.productShortDisc} onChange={onChange} />
                        </div>
                        <div className="form-area">
                            <label htmlFor="productDisc">Product Discription</label>
                            <input type="text" name="productDisc" id="productDisc" value={state.productDisc} onChange={onChange} />
                        </div>
                        <div className="form-area">
                            <label htmlFor="productkeywords">Product Keywords <small><i>(keyword1, keyword2, ....)</i></small></label>
                            <input type="text" name="productkeywords" id="productkeywords" value={state.productkeywords} onChange={onChange} />
                        </div>
                        <div className="form-area radio">
                            <label htmlFor="">Product Status</label>
                            <div>
                                <input type="radio" value='1' name="productStatus" id="proActiveStat" onChange={onChange} />
                                <label htmlFor="proActiveStat">Active</label>
                            </div>
                            <div>
                                <input type="radio" value='0' name="productStatus" id="proDeactiveStat" onChange={onChange} />
                                <label htmlFor="proDeactiveStat">Deactive</label>
                            </div>
                        </div>
                        <button onClick={onUpdate} className='update'>Update</button>
                    </div>
                ) : null
            }
            <div className="form-general">
                <label htmlFor="productName">[ Variations ]</label>
                <div className="generalProduct">
                    <div className="left">
                        <div className="form-area s-p-t">
                            <label htmlFor="">Product Type</label>
                            <select name="productType" value={state.productType} onChange={onChange}>
                                <option value="0">Simple Product</option>
                                <option value="1">Variable Product</option>
                            </select>
                        </div>
                        {state.productType == 0 ? (
                            <>
                                <div className="form-area mt-50" style={{ marginTop: '30px' }}>
                                    {
                                        state.simpleImageList.length == 0 ? (
                                            <p className="textNoFound">No Images, Please Upload Images for Product</p>
                                        ) : (
                                            <div className="pImgList">
                                                {
                                                    state.simpleImageList.map((img, i) => (
                                                        <div className="img">
                                                            <div className="delete" onClick={() => { deleteSimpleImage(finalProduct[0], i) }}>x</div>
                                                            <img src={img} alt="" />
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="form-area">
                                    <div className="productImgs">
                                        <ImageUploader
                                            withPreview={true}
                                            onChange={onImgDrop}
                                            imgExtension={['.jpg', '.png', '.jpeg']}
                                            maxFileSize={5242880}
                                            buttonText={'Upload New Images'}
                                        />
                                    </div>
                                </div>
                                <div className="form-area mt-50">
                                    <label htmlFor="">MRP</label>
                                    <input type="text" name='simpleMrp' value={state.simpleMrp} onChange={onChange} />
                                </div>
                                <div className="form-area">
                                    <label htmlFor="">Price</label>
                                    <input type="text" name='simplePrice' value={state.simplePrice} onChange={onChange} />
                                </div>
                                <div className="form-area">
                                    <label htmlFor="">Quantity</label>
                                    <input type="text" name='simpleQty' value={state.simpleQty} onChange={onChange} />
                                </div>
                                <div className="simpleDtl">
                                    <label htmlFor="">Add Detail</label>
                                    <span>
                                        <div className="form-area">
                                            <label htmlFor="">Key</label>
                                            <input type="text" name='simpleDtlKey' value={state.simpleDtlKey} onChange={onChange} />
                                        </div>
                                        <div className="form-area">
                                            <label htmlFor="">Value</label>
                                            <input type="text" name='simpleDtlValue' value={state.simpleDtlValue} onChange={onChange} />
                                        </div>
                                        <div className="form-area">
                                            <button onClick={addSimpleDtl}>Add</button>
                                        </div>
                                    </span>
                                    <div className="listDtl">
                                        {
                                            state.simpleDtl.length == 0 ? 'No details, Please Add Detail' : (
                                                state.simpleDtl.map((dtl, index) => (
                                                    <ul key={index}>
                                                        <span onClick={() => deleteSimpleDtl(index)}>X</span>
                                                        <li>{dtl[0]}</li>
                                                        <li>{dtl[1]}</li>
                                                    </ul>
                                                ))
                                            )
                                        }
                                    </div>
                                </div>
                                <button className='update' onClick={saveSimpleProduct}>Save</button>
                            </>
                        ) : state.productType == 1 ? (
                            <>
                                <div>
                                    {
                                        state.varientList.length != 0 ? <button onClick={() => toast.error('You can\'t make changes after making varients otherwise delete your all varients. Because all varient must have equal no. of variations')}>Select Attributes (disabled)</button> :
                                            <button onClick={() => document.getElementsByClassName('popupSelectedVarients')[0].classList.add('active')}>Select Attributes</button>
                                    }
                                </div>
                                <div className="popupSelectedVarients">
                                    {
                                        state.attributes.map((obj, index) => (
                                            <span key={obj._id}>
                                                {/* htmlFor={`var${index}`} */}
                                                <label>{obj.attribute}</label>
                                                <input type="checkbox" onChange={(e) => setSelectedVarients(obj._id)} name={`var${index}`} id={`var${index}`} checked={!!state.tempSelectedVarients.includes(obj._id)} />
                                            </span>
                                        ))
                                    }
                                    <div className='btnss'>
                                        <button className="update" onClick={saveSelectedVar}>Save</button>
                                        <button className="delete" onClick={cancelSelectedVar}>cancel</button>
                                    </div>
                                </div>
                                <div className="form-area blackBg">
                                    <label htmlFor="">
                                        <span>Select Attributes</span>
                                        <button onClick={makeVarient}>Add Varient</button>
                                    </label>
                                    <div className="data">
                                        {
                                            state.selectedVarients.length == 0 ? <span className='_nV'>First Select Variation....</span> :
                                                state.attributes.map((obj) =>
                                                    state.selectedVarients.includes(obj._id) ?
                                                        <select key={obj._id} onChange={(e) => { setAttr(e, obj._id) }}>
                                                            <option value="">Select {obj.attribute}</option>
                                                            {
                                                                obj.values.map((value, key) => (
                                                                    <option key={key} value={value}>{value}</option>
                                                                ))
                                                            }
                                                        </select> : null
                                                )
                                        }
                                    </div>
                                </div>

                                <div className="varientList">
                                    {
                                        state.varientList.length == 0 ? (
                                            <span className='_nV'>
                                                No Varient. &#128532; Add New varient Now
                                            </span>
                                        ) : null
                                    }
                                    {state.varientList.map((obj, index) => (
                                        <div key={obj._id} className="sub-list">
                                            <div className="topList">
                                                <span>
                                                    {
                                                        obj.varienteAttributes.map((a, indexx) => (
                                                            <>
                                                                <span className="_llv">{getAttrName(a.attr_id)}</span>
                                                                <span key={indexx}>
                                                                    {obj.varienteAttributes.length != (indexx + 1) ? (
                                                                        <>
                                                                            {`${a.value}, `}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {`${a.value}`}
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </>
                                                        ))
                                                    }
                                                </span>
                                                <div className="options" onClick={() => openGeneral(obj._id)}>more</div>
                                            </div>
                                            <div className={`exploreMore general ${obj._id}`}>
                                                <div className="form-area row">
                                                    <div className="left">
                                                        <div className="listImages">
                                                            {
                                                                obj.general.images.length == 0 ? (
                                                                    <>
                                                                        <p>No Images 😔</p>
                                                                        <p>Upload Now 😍</p>
                                                                    </>
                                                                ) : null
                                                            }
                                                            {obj.general.images.map((img, imgIndex) => (
                                                                <div className="img" key={imgIndex}>
                                                                    <div className="delete" onClick={() => { deleteVarImage(finalProduct[0], obj._id, imgIndex) }}>X</div>
                                                                    <img src={img} alt='img' />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="right">
                                                        <ImageUploader
                                                            withPreview={true}
                                                            onChange={onDrop}
                                                            imgExtension={['.jpg', '.png', '.jpeg']}
                                                            maxFileSize={5242880}
                                                            buttonText={'Upload New Images'}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-area">
                                                    <label htmlFor="">MRP</label>
                                                    <input type="text" name={`varMrp`} onChange={(e) => onMrpChange(e, index)} value={state.varMrps[index]} />
                                                </div>
                                                <div className="form-area">
                                                    <label htmlFor="">Price</label>
                                                    <input type="text" name={`varPrices`} onChange={(e) => onPriceChange(e, index)} value={state.varPrices[index]} />
                                                </div>
                                                <div className="form-area">
                                                    <label htmlFor="">Qty</label>
                                                    <input type="text" name={`varItemQty`} onChange={(e) => onItemQtyChange(e, index)} value={state.varItemQty[index]} />
                                                </div>
                                                <div className="simpleDtl">
                                                    <label htmlFor="">Add Detail</label>
                                                    <span>
                                                        <div className="form-area">
                                                            <label htmlFor="">Key</label>
                                                            <input type="text" name='varDtlKey' value={state.varDtlKey[index]} onChange={(e) => onVarDtlKeyChange(e, index)} />
                                                        </div>
                                                        <div className="form-area">
                                                            <label htmlFor="">Value</label>
                                                            <input type="text" name='varDtlValue' value={state.varDtlValue[index]} onChange={(e) => onVarDtlValueChange(e, index)} />
                                                        </div>
                                                        <div className="form-area">
                                                            <button onClick={() => addVarDtl(index)}>Add</button>
                                                        </div>
                                                    </span>
                                                    <div className="listDtl">
                                                        {
                                                            state.varDtl[index].length == 0 ? 'No details 😔, Please Add Detail' : (
                                                                state.varDtl[index].map((dtl, indexx) => (
                                                                    <ul key={indexx}>
                                                                        <span onClick={() => deleteVarDtl(index, indexx)}>X</span>
                                                                        <li>{dtl[0]}</li>
                                                                        <li>{dtl[1]}</li>
                                                                    </ul>
                                                                ))
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                <div className="form-area btns">
                                                    <button onClick={() => updateVar(obj._id, index)} className='update' id={`updateVarBtn${obj._id}`}>Update</button>
                                                    <button onClick={() => deleteVar(obj._id, index)} className='delete' id={`deleteVarBtn${obj._id}`}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </div>
                    <div className="right">
                        <ImageUploader
                            withPreview={true}
                            onChange={onCoverDrop}
                            imgExtension={['.jpg', '.png', '.jpeg']}
                            maxFileSize={5242880}
                            buttonText={`${
                            state.CoverPictures.length == 0 ?
                                state.coverImagesList.length == 0 ?
                                    'Upload Cover Image' :
                                    'Change Cover Image' : ''

                            }`}
                            singleImage={true}
                        />
                        {
                            state.CoverPictures.length != 0 ?
                                state.coverImagesList.length == 0 ?
                                    <span onClick={uploadCoverImages}>Upload Cover Image</span> :
                                    <span onClick={uploadCoverImages}>Change Cover Image</span> : null
                        }
                        <div className="CoverImageList">
                            {
                                state.coverImagesList.map((img, index) => (
                                    <div key={index} className="img">
                                        <img src={img} alt={`coverImage`} />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddVarient;