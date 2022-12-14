import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'
import ImageUploader from 'react-images-upload'

import './SelectCat.css'
import { KEYS } from '../../keys';
import { useStateValue } from '../../../StateProvider/StateProvider';
import { getTokenAdmin } from '../../../helpers/auth';

const SelectCat = ({ stateChanger, ...rest }) => {
    const [store, dispatch] = useStateValue();
    const [state, setState] = useState({
        selectedCategory: undefined,
        selectedCategoryName: '',
        catList: [],
        pictures: [],
        picUrls: [],
        newCategoryName: '',
        empty: false,
    })

    useEffect(() => {
        dispatch({
            type: 'SET_LOADING'
        })
        axios.get(`${KEYS.NODE_URL}/api/vendor/product/156/getCategories`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        })
            .then(result => {
                if (result.data.myCategories.length == 0) {
                    setState({
                        ...state,
                        empty: true
                    })
                    dispatch({
                        type: 'UNSET_LOADING'
                    })
                    return
                }
                state.catList = []
                let e = true
                result.data.myCategories.map(cat => {
                    if(cat.categoryStatus == 1) e = false
                    let newCat = {
                        catId: cat._id,
                        catName: cat.categoryName,
                        catImage: cat.categoryImage,
                        catStatus: cat.categoryStatus
                    }
                    state.catList.push(newCat)
                })
                e ? setState({ ...state, catList: state.catList, empty: true }) : setState({ ...state, catList: state.catList });
                dispatch({ type: 'UNSET_LOADING' })
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
        state.catList.map(cat => (
            cat.catId == e.target.value ? setState({ ...state, [e.target.name]: e.target.value, selectedCategoryName: cat.catName }) : null
        ))

        let d = document.getElementsByClassName(`catLabel`)
        for (let i = 0; i < d.length; i++) {
            d[i].classList.remove('selected')
        }
        document.getElementById(`cat_label_${id}`).classList.add('selected')
    }

    const onSubmit = (e) => {
        if (state.selectedCategory == undefined) {
            alert('please select any one category to furthure pursued...')
            return
        }
        if (true) {
            document.getElementsByClassName('product-content')[0].classList.add('animate')
            setTimeout(() => {
                document.getElementsByClassName('product-content')[0].classList.remove('animate')
                document.getElementsByClassName('timeLine1')[0].classList.remove('active')
                document.getElementsByClassName('timeLine1')[1].classList.remove('active')

                document.getElementsByClassName('timeLine1')[0].classList.add('done')
                document.getElementsByClassName('timeLine1')[1].classList.add('done')

                document.getElementsByClassName('timeLine2')[0].classList.add('active')
                document.getElementsByClassName('timeLine2')[1].classList.add('active')

                stateChanger(
                    {
                        ...state,
                        ['task']: '2',
                        ['selectedCategory']: [state.selectedCategory, state.selectedCategoryName],
                    }
                )
            }, 500)

        }
    }
    const makeCat = () => {
        dispatch({
            type: 'SET_LOADING'
        })
        document.getElementById('makeCatBtn').disabled = true
        document.getElementsByClassName('add_new')[0].disabled = true
        if (state.newCategoryName == '') {
            dispatch({
                type: 'UNSET_LOADING'
            })
            alert('Plese Enter New Category Name')
            document.getElementById('makeCatBtn').disabled = false
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
                    "newCategoryName": state.newCategoryName,
                    "images": state.picUrls,
                }
                axios.post(`${KEYS.NODE_URL}/api/vendor/product/156/insertCategory`, data,
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
                        document.getElementsByClassName('addCat')[0].classList.toggle('show')
                        document.getElementsByClassName('add_new')[0].classList.toggle('open')
                        state.catList = []
                        result.data.myCategories.map(cat => {
                            let newCat = {
                                catId: cat._id,
                                catName: cat.categoryName,
                                catImage: cat.categoryImage,
                                catStatus: cat.categoryStatus
                            }
                            state.catList.push(newCat)
                        })
                        state.pictures = []
                        setState({
                            ...state,
                            catList: state.catList,
                            pictures: state.pictures,
                            picUrls: [],
                            newCategoryName: '',
                            empty: false,
                        });
                        document.getElementsByClassName('add_new')[0].disabled = false
                        document.getElementById('makeCatBtn').disabled = false
                    })
                    .catch(err => {
                        document.getElementById('makeCatBtn').disabled = false
                        document.getElementsByClassName('add_new')[0].disabled = false
                        console.log(err)
                    })
            })
            .catch(e => {
                document.getElementsByClassName('add_new')[0].disabled = false
                document.getElementById('makeCatBtn').disabled = false
                console.log('error', e)
            })
    }
    const addNewCat = () => {
        document.getElementsByClassName('addCat')[0].classList.toggle('show')
        document.getElementsByClassName('add_new')[0].classList.toggle('open')
    }
    return (
        <>
            <div className="bottom_btns">
                <button type='button' className='add_new' onClick={addNewCat}>+</button>
                <button type='button' onClick={onSubmit} className='continue_btn' title='continue'><span className={state.selectedCategoryName == '' ? 'hide' : ''}>{state.selectedCategoryName}</span><i className='fa fa-arrow-right'></i></button>
            </div >
            <div className="addCat">
                <div className="form-area">
                    <label htmlFor="">Category Name</label>
                    <input type="text" placeholder={`Type...`} value={state.newCategoryName} name="newCategoryName" onChange={onInputChange} />
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
                    <button id='makeCatBtn' onClick={makeCat}>Insert New Category</button>
                </div>
            </div>
            <div className="form-area">
                <div className="select">
                    {
                        state.empty ? <span className='textNoFound'>No Active Category Available, create New Category now from plus(+) sign bottom</span> : null
                    }
                    {
                        state.catList.map((data, index) => data.catStatus == 1 ?
                            <div key={index} className={`option ${index}`}>
                                <label htmlFor={`selectedCategory${index}`} className={'catLabel'} id={`cat_label_${index}`}>{data.catName}</label>
                                <input type="radio" name="selectedCategory" id={`selectedCategory${index}`} value={data.catId} onChange={(e) => { onChange(e, index) }} />
                            </div> : null)
                    }
                </div>
            </div>
        </>
    );
}

export default SelectCat;
