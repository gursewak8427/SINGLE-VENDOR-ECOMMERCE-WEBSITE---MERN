import React, { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom'
import axios from 'axios'
import { getTokenAdmin } from '../../helpers/auth'
import './VProduct.css'

import VProTimeLine from './common/VProTimeLine'
// product-components
import SelectCat from './productComponents/SelectCat';
import SelectSubCat from './productComponents/SelectSubCat';
import AddProduct from './productComponents/AddProduct';
import AddVarient from './productComponents/AddVarient';
import { KEYS } from '../keys';

function VProduct() {
    const [state, setState] = useState({
        task: '',
        selectedCategory: undefined,
        selectedSubCategory: undefined,
        finalProduct: undefined,
        catList: [],
        subCatList: []
    })
    const { id } = useParams()
    useEffect(() => {
        setTimeout(()=>{
            document.getElementsByClassName('product-content')[0].classList.remove('animate')
        }, 500)
        if (id) {
            axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getRawData`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `barear ${getTokenAdmin()}`
                  }
            })
                .then(resultRawData => {
                    state.catList = []
                    state.subCatList = []
                    state.catList = resultRawData.data.myRawData.categories
                    state.subCatList = resultRawData.data.myRawData.subCategories

                    axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/getProductWithID`, { id },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `barear ${getTokenAdmin()}`
                          }
                    })
                        .then(result => {
                            if (!result.data.myCollection) {
                                setState({
                                    ...state,
                                    task: '5'
                                })
                            }
                            var catId = result.data.myCollection.productParents.category
                            var subCatId = result.data.myCollection.productParents.subCategory
                            var catName = ''
                            var subCatName = ''
                            state.catList.map(cat => (cat._id == catId ? catName = cat.categoryName : null))
                            state.subCatList.map(subCat => (subCat._id == subCatId ? subCatName = subCat.subCategoryName : null))

                            // assign category and sub-category of product to props
                            var cat = [catId, catName]
                            var subCat = [subCatId, subCatName]

                            setState({
                                ...state,
                                catList: state.catList,
                                subCatList: state.subCatList,
                                selectedCategory: cat,
                                selectedSubCategory: subCat,
                                finalProduct: [result.data.myCollection._id, result.data.myCollection.productName],
                                task: '4'
                            });
                        }).catch(err => {
                            console.log(err)
                        })
                })
                .catch(err => {
                    console.log(err)
                })
        } else {
            setState({
                ...state,
                task: '1'
            });
        }
    }, [])

    return (
        <>
            <div className="v-wrapper">
                <div className="design"></div>
                <div className="v-product">
                    <h1 className="label">Product {id ? 'Update' : 'Insert'}</h1>
                    {id ? null : (
                        <VProTimeLine stateChanger={setState} />
                    )}
                    <div className="product-content animate">
                        {
                            state.task == '1' ? (
                                <SelectCat stateChanger={setState} />
                            ) : state.task == '2' ? (
                                <SelectSubCat stateChanger={setState} cat={state.selectedCategory} />
                            ) : state.task == '3' ? (
                                <AddProduct stateChanger={setState} finalCat={state.selectedCategory} finalSubCat={state.selectedSubCategory} />
                            ) : state.task == '4' ? (
                                <AddVarient stateChanger={setState} finalCat={state.selectedCategory} finalSubCat={state.selectedSubCategory} finalProduct={state.finalProduct} />
                            ) : state.task == '5' ? (
                                <div class='notFound'>
                                    Product Not Found
                                </div>
                            ) : null
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default VProduct;
