import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'
import ImageUploader from 'react-images-upload'

import './SelectSubCat.css'
import { KEYS } from '../../keys';
import { useStateValue } from '../../../StateProvider/StateProvider';
import { getTokenAdmin } from '../../../helpers/auth';

const SelectSubCat = ({ stateChanger, cat, ...rest }) => {
    const [store, dispatch] = useStateValue();
    const [state, setState] = useState({
        selectedCategory: cat,
        selectedSubCategory: undefined,
        selectedSubCategoryName: '',
        pictures: [],
        picUrls: [],
        newSubCategoryName: '',
        subCatList: [],
        empty: false,
    })
    useEffect(() => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getSubCategories?parent=${cat[0]}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                if (result.data.mySubCategories.length == 0) {
                    setState({
                        ...state,
                        empty: true
                    })
                    dispatch({
                        type: 'UNSET_LOADING'
                    })
                }
                state.subCatList = []
                let e = true
                result.data.mySubCategories.map(subCat => {
                    if(subCat.subCategoryStatus == 1) e = false
                    let newSubCat = {
                        subCatId: subCat._id,
                        subCatName: subCat.subCategoryName,
                        subCatParent: subCat.subCategoryParent,
                        subCatImage: subCat.subCategoryImage,
                        subCatStatus: subCat.subCategoryStatus
                    }
                    dispatch({
                        type: 'UNSET_LOADING'
                    })
                    state.subCatList.push(newSubCat)
                })
                e ?
                    setState({
                        ...state,
                        subCatList: state.subCatList,
                        empty: true
                    }) : setState({
                        ...state,
                        subCatList: state.subCatList,
                    })

                // document.getElementById(`updateVarBtn${var_id}`).disabled = false
            })
            .catch(err => {
                // document.getElementById(`updateVarBtn${var_id}`).disabled = false
                console.log(err)
            })
    }, [])
    const onDrop = picture => {
        setState({
            ...state,
            pictures: picture
        });
    }
    const onInputChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value });
    }
    const onChange = (e, id) => {
        state.subCatList.map(subCat => subCat.subCatId == e.target.value ? setState({ ...state, [e.target.name]: e.target.value, selectedSubCategoryName: subCat.subCatName }) : null)
        let i = 0
        while (i < state.subCatList.length) {
            i == id ? document.getElementById(`subCat_label_${i}`).classList.add('selected') : document.getElementById(`subCat_label_${i}`).classList.remove('selected')
            i += 1
        }
    }
    const onSubmit = (e) => {
        if (state.selectedSubCategory == undefined) {
            alert('please select any one sub category to furthure pursued...')
            return
        }
        if (true) {
            document.getElementsByClassName('product-content')[0].classList.add('animate')
            setTimeout(() => {
                document.getElementsByClassName('product-content')[0].classList.remove('animate')

                document.getElementsByClassName('timeLine2')[0].classList.remove('active')
                document.getElementsByClassName('timeLine2')[1].classList.remove('active')

                document.getElementsByClassName('timeLine2')[0].classList.add('done')
                document.getElementsByClassName('timeLine2')[1].classList.add('done')

                document.getElementsByClassName('timeLine3')[0].classList.add('active')
                document.getElementsByClassName('timeLine3')[1].classList.add('active')
                stateChanger(
                    {
                        ...state,
                        ['task']: '3',
                        ['selectedSubCategory']: [state.selectedSubCategory, state.selectedSubCategoryName],
                    }
                )
            }, 500)
        }
    }

    const makeCat = () => {
        dispatch({
            type: 'SET_LOADING'
        })
        document.getElementById('makeSubCatBtn').disabled = true
        document.getElementsByClassName('add_new')[0].disabled = true
        if (state.newSubCategoryName == '') {
            dispatch({
                type: 'UNSET_LOADING'
            })
            alert('Plese Enter New Category Name')
            document.getElementById('makeSubCatBtn').disabled = false
            document.getElementsByClassName('add_new')[0].disabled = false
            return
        }
        let uploadPromises = state.pictures.map(image => {
            let data = new FormData();
            data.append('file', image);
            data.append('upload_preset', 'eshoppyzone');
            data.append('cloud_name', 'mycloud8427');
            return axios.post(`https://api.cloudinary.com/v1_1/mycloud8427/image/upload/`, data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `barear ${getTokenAdmin()}`
                  }
            })
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
                    "newSubCategoryName": state.newSubCategoryName,
                    "parent": cat[0],
                    "images": state.picUrls,
                }
                axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/insertSubCategory`, data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `barear ${getTokenAdmin()}`
                      }
                })
                    .then(result => {
                        document.getElementsByClassName('addCat')[0].classList.toggle('show')
                        document.getElementsByClassName('add_new')[0].classList.toggle('open')
                        state.subCatList = []
                        result.data.mySubCategories.map(subCat => {
                            let newSubCat = {
                                subCatId: subCat._id,
                                subCatName: subCat.subCategoryName,
                                subCatParent: subCat.subCategoryParent,
                                subCatImage: subCat.subCategoryImage,
                                subCatStatus: subCat.subCategoryStatus,
                            }
                            state.subCatList.push(newSubCat)
                        })
                        state.pictures = []
                        setState({
                            ...state,
                            subCatList: state.subCatList,
                            pictures: state.pictures,
                            picUrls: [],
                            newSubCategoryName: '',
                            empty: false
                        });
                        dispatch({
                            type: 'UNSET_LOADING'
                        })
                        document.getElementById('makeSubCatBtn').disabled = false
                        document.getElementsByClassName('add_new')[0].disabled = false

                    })
                    .catch(err => {
                        document.getElementById('makeSubCatBtn').disabled = false
                        document.getElementsByClassName('add_new')[0].disabled = false
                        console.log(err)
                    })
            })
            .catch(e => {
                document.getElementById('makeSubCatBtn').disabled = false
                document.getElementsByClassName('add_new')[0].disabled = false
                console.log('error', e)
            })
    }
    const addNewSubCat = () => {
        document.getElementsByClassName('addCat')[0].classList.toggle('show')
        document.getElementsByClassName('add_new')[0].classList.toggle('open')
    }
    return (
        <>
            <h1 className="product_for">{cat[1]} /</h1>
            <div className="bottom_btns">
                <button type='button' className='add_new' onClick={addNewSubCat} title={`Add New Subcategory to ${cat[1]}`}>+</button>
                <button type='button' onClick={onSubmit} className='continue_btn' title={state.selectedSubCategory ? `Continue with ${state.selectedSubCategoryName}` : `Please Select SubCategory`}><span className={state.selectedSubCategoryName == '' ? 'hide' : ''}>{state.selectedSubCategoryName}</span><i className='fa fa-arrow-right'></i></button>
            </div>
            <div className="addCat">
                <div className="form-area">
                    <label htmlFor="">Sub Category Name</label>
                    <input type="text" placeholder={`Type...`} value={state.newSubCategoryName} name="newSubCategoryName" onChange={onInputChange} />
                </div>
                <div className="form-area">
                    <ImageUploader
                        withPreview={true}
                        onChange={onDrop}
                        imgExtension={['.jpg', '.png', '.jpeg']}
                        maxFileSize={5242880}
                        buttonText={'Upload New Images'}
                        singleImage={true}
                    />
                </div>
                <div className="form-area">
                    <button id='makeSubCatBtn' onClick={makeCat}>Insert New Sub Category</button>
                </div>
            </div>
            <div className="form-area">
                <div className="select">
                    {
                        state.empty ? <span className='textNoFound'>No Active Sub-Category Available, create New Category now from plus(+) sign bottom</span> : null
                    }
                    {
                        state.subCatList.map((data, index) => data.subCatStatus == 1 ?
                            <div key={index} className={`option ${index}`}>
                                <label htmlFor={`selectedSubCategory${index}`} id={`subCat_label_${index}`}>{data.subCatName}</label>
                                <input type="radio" name="selectedSubCategory" id={`selectedSubCategory${index}`} value={data.subCatId} onChange={(e) => { onChange(e, index) }} />
                            </div> : null
                        )}
                </div>
            </div>
        </>
    );
}

export default SelectSubCat;
