import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'
import './AddProduct.css'
import { KEYS } from '../../keys';
import { useStateValue } from '../../../StateProvider/StateProvider';
import { getTokenAdmin } from '../../../helpers/auth';

function AddProduct({ stateChanger, finalCat, finalSubCat, ...rest }) {
    const [store, dispatch] = useStateValue();
    const [state, setState] = useState({
        productName: '',
        productBrand: '',
        productShortDisc: '',
        productDisc: '',
        productkeywords: '',
        productStatus: 0,
    })

    const onChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value })
    }
    const onSubmit = () => {
        document.getElementById('subMitBtn').disabled = true
        if (state.productName && state.productBrand) {
            let newProduct = {
                "parents": {
                    "category": finalCat[0],
                    "subCategory": finalSubCat[0]
                },
                "productName": state.productName,
                "productBrand": state.productBrand,
                "productShortDisc": state.productShortDisc,
                "productDisc": state.productDisc,
                "productkeywords": state.productkeywords,
                "productStatus": state.productStatus,
            }
            // upload product and get product id
            axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/insertProduct`, newProduct,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `barear ${getTokenAdmin()}`
                  }
            })
                .then(result => {
                    setState({
                        ...state,
                        productBrand: '',
                        productShortDisc: '',
                        productDisc: '',
                        productkeywords: '',
                        productStatus: 0,
                    });

                    document.getElementsByClassName('product-content')[0].classList.add('animate')
                    setTimeout(() => {
                        document.getElementsByClassName('product-content')[0].classList.remove('animate')
                        document.getElementsByClassName('timeLine3')[0].classList.remove('active')
                        document.getElementsByClassName('timeLine3')[1].classList.remove('active')

                        document.getElementsByClassName('timeLine3')[0].classList.add('done')
                        document.getElementsByClassName('timeLine3')[1].classList.add('done')

                        document.getElementsByClassName('timeLine4')[0].classList.add('active')
                        document.getElementsByClassName('timeLine4')[1].classList.add('active')

                        stateChanger(
                            {
                                ...state,
                                ['task']: '4',
                                ['selectedCategory']: finalCat,
                                ['selectedSubCategory']: finalSubCat,
                                ['finalProduct']: [result.data.productId, state.productName],
                            }
                        )
                    }, 500)
                    document.getElementById('subMitBtn').disabled = false
                })
                .catch(err => {
                    document.getElementById('subMitBtn').disabled = false
                    console.log(err)
                })
        } else {
            document.getElementById('subMitBtn').disabled = false
            alert('all fields are required')
        }
    }
    return (
        <>
            <div className="bottom_btns">
                <button type='button' onClick={onSubmit} id='subMitBtn' className='continue_btn' title='continue'><i className='fa fa-arrow-right'></i></button>
            </div>
            <h1 className="product_for">{finalCat[1]} / {finalSubCat[1]}</h1>
            <div className="form-product">
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
            </div>
        </>
    );
}

export default AddProduct;
