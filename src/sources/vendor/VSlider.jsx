import React, { useEffect, useState } from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'
import { getTokenAdmin } from '../../helpers/auth'
import ImageUploader from 'react-images-upload'

import './VSlider.css'
import { KEYS } from '../keys';
import { useStateValue } from '../../StateProvider/StateProvider';

function VSlider() {
    const [store, dispatch] = useStateValue();
    const [state, setState] = useState({
        newSliderName: '',
        newSliderLink: '',
        pictures: [],
        picUrls: [],
        sliderList: [],
        updateIndex: undefined,
        empty: false
    })

    useEffect(() => {
        dispatch({ type: 'SET_LOADING' })
        axios.get(`${KEYS.NODE_URL}/api/vendor/general/156/getSlider`,{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        }).then(result => {
            if (result.data.finalData.length == 0) {
                setState({
                    ...state,
                    empty: true
                })
            }
            dispatch({ type: 'UNSET_LOADING' })
            setState({ ...state, sliderList: result.data.finalData })
        }).catch(err => {
            dispatch({ type: 'UNSET_LOADING' })
            console.log(err)
        })
    }, [])
    
    const onInputChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value });
    }
    const onDrop = picture => {
        setState({
            ...state,
            pictures: picture
        });
    }
    const openNewSliderBox = () => {
        setState({
            ...state,
            updateIndex: undefined,
            newSliderName: '',
            newSliderLink: '',
        });
        document.getElementsByClassName('addCat')[0].classList.toggle('show')
        document.getElementsByClassName('add_new')[0].classList.toggle('open')
    }
    const addSlider = () => {
        if (state.newSliderLink == '') {
            alert('Plese Fill all Fields')
            return
        }
        if (state.pictures.length != 2) {
            alert('Please select two images')
            return
        }
        dispatch({ type: 'SET_LOADING' })
        let uploadPromises = state.pictures.map(image => {
            let data = new FormData();
            data.append('file', image);
            data.append('upload_preset', 'eshoppyzone');
            data.append('cloud_name', 'mycloud8427');
            return axios.post(`https://api.cloudinary.com/v1_1/mycloud8427/image/upload/`, data)
        })
        axios.all(uploadPromises).then(results => {
            state.picUrls = []
            results.map(img => {
                state.picUrls.push(img.data.url)
                setState({ ...state, picUrls: state.picUrls })
            })
            let data = {
                "name": state.newSliderName,
                "link": state.newSliderLink,
                "img": state.picUrls,
            }
            axios.post(`${KEYS.NODE_URL}/api/vendor/general/156/insertSlider`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `barear ${getTokenAdmin()}`
                  }
            }).then(result => {
                dispatch({ type: 'UNSET_LOADING' })
                document.getElementsByClassName('addCat')[0].classList.toggle('show')
                document.getElementsByClassName('add_new')[0].classList.toggle('open')
                setState({ ...state, sliderList: result.data.finalData.mainSlider })
            }).catch(err => {
                dispatch({ type: 'UNSET_LOADING' })
                console.log(err)
            })
        }).catch(e => {
            console.log('error', e)
            dispatch({ type: 'UNSET_LOADING' })
        })
    }
    const setUpdate = index => {
        setState({
            ...state,
            updateIndex: index,
            newSliderName: state.sliderList[index].name,
            newSliderLink: state.sliderList[index].link,
        })
        document.getElementsByClassName('addCat')[0].classList.add('show')
        document.getElementsByClassName('add_new')[0].classList.add('open')
    }
    const updateSlider = () => {
        if (state.pictures.length != 2) {
            alert('Please select two images')
            return
        }
        dispatch({ type: 'SET_LOADING' })
        let uploadPromises = state.pictures.map(image => {
            let data = new FormData();
            data.append('file', image);
            data.append('upload_preset', 'eshoppyzone');
            data.append('cloud_name', 'mycloud8427');
            console.log(data)
            return axios.post(`https://api.cloudinary.com/v1_1/mycloud8427/image/upload/`, data)
        })
        axios.all(uploadPromises).then(results => {
            state.picUrls = []
            results.map(img => {
                state.picUrls.push(img.data.url)
                setState({ ...state, picUrls: state.picUrls })
            })
            let data = {
                index: state.updateIndex,
                name: state.newSliderName,
                link: state.newSliderLink,
                img: state.picUrls
            }
            axios.post(`${KEYS.NODE_URL}/api/vendor/general/156/updateSlider`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `barear ${getTokenAdmin()}`
                  }
            }).then(result => {
                dispatch({ type: 'UNSET_LOADING' })
                document.getElementsByClassName('addCat')[0].classList.toggle('show')
                document.getElementsByClassName('add_new')[0].classList.toggle('open')
                setState({ ...state, sliderList: result.data.finalData.mainSlider })
            }).catch(err => {
                dispatch({ type: 'UNSET_LOADING' })
                console.log(err.response)
            })
        }).catch(e => {
            dispatch({ type: 'UNSET_LOADING' })
            console.log('error', e)
        })
    }
    const deleteIndex = index => {
        dispatch({ type: 'SET_LOADING' })
        axios.post(`${KEYS.NODE_URL}/api/vendor/general/156/deleteSlider`, { index }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `barear ${getTokenAdmin()}`
              }
        }).then(result => {
            dispatch({ type: 'UNSET_LOADING' })
            setState({ ...state, sliderList: result.data.finalData.mainSlider })
        }).catch(err => {
            console.log(err.response)
            dispatch({ type: 'UNSET_LOADING' })
        })
    }
    return (
        <>
            <div className="bottom_btns">
                <button type='button' className='add_new' onClick={openNewSliderBox}>+</button>
            </div>
            <div className="addCat">
                <div className="form-area">
                    <label htmlFor="">Slider Name</label>
                    <input type="text" placeholder={`Type...`} value={state.newSliderName} name="newSliderName" onChange={onInputChange} />
                </div>
                <div className="form-area">
                    <label htmlFor="">Slider Redirection Link</label>
                    <input type="text" placeholder={`Type...`} value={state.newSliderLink} name="newSliderLink" onChange={onInputChange} />
                </div>
                <div className="form-area">
                    <ImageUploader
                        withPreview={true}
                        onChange={onDrop}
                        imgExtension={['.jpg', '.png','.jpeg']}
                        maxFileSize={5242880}
                        buttonText={'Upload New Images'}
                    />
                </div>
                <div className="form-area">
                    {
                        state.updateIndex != undefined ? <button onClick={updateSlider}>Update</button> : <button onClick={addSlider}>Insert New Link</button>
                    }
                </div>
            </div>
            <div className="v-wrapper">
                <div className="design"></div>
                <div className="v-product">
                    <h1 className="label">Main Slider Control</h1>
                    <div className="product-content">
                        <div className="sliderList">
                            {
                                state.empty ? <span style={{ color: "white", margin: "10px" }}>No Slider Available</span> : null
                            }
                            {
                                state.sliderList.map((slide, index) => (
                                    <div className="slide">
                                        <div className="btns">
                                            <i onClick={() => setUpdate(index)} className="fas fa-edit update"></i>
                                            <i onClick={() => deleteIndex(index)} className="far fa-trash-alt delete"></i>
                                        </div>
                                        <img src={slide.image[1]} />
                                        <span>{slide.name}</span>
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

export default VSlider;
