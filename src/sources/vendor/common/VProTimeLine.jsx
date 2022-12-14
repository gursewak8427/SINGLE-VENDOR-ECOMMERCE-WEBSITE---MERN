import React from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'

import './VProTimeLine.css'

function VProTimeLine({ stateChanger, ...rest }) {
    const stateChange = id => {
        stateChanger(
            {
                ['task']: id,
            }
        )
    // =====================================================================================
        document.getElementsByClassName('timeLine1')[0].classList.add('active')
        document.getElementsByClassName('timeLine1')[1].classList.add('active')

        document.getElementsByClassName('timeLine2')[0].classList.remove('active')
        document.getElementsByClassName('timeLine2')[1].classList.remove('active')

        document.getElementsByClassName('timeLine3')[0].classList.remove('active')
        document.getElementsByClassName('timeLine3')[1].classList.remove('active')

        document.getElementsByClassName('timeLine4')[0].classList.remove('active')
        document.getElementsByClassName('timeLine4')[1].classList.remove('active')

    // =====================================================================================

        document.getElementsByClassName('timeLine1')[0].classList.remove('done')
        document.getElementsByClassName('timeLine1')[1].classList.remove('done')

        document.getElementsByClassName('timeLine2')[0].classList.remove('done')
        document.getElementsByClassName('timeLine2')[1].classList.remove('done')

        document.getElementsByClassName('timeLine3')[0].classList.remove('done')
        document.getElementsByClassName('timeLine3')[1].classList.remove('done')

        document.getElementsByClassName('timeLine4')[0].classList.remove('done')
        document.getElementsByClassName('timeLine4')[1].classList.remove('done')

    // =====================================================================================

    }
    return (
        <>
            <div className="product-time-line">
                <div className="text">
                    <span className='timeLine1 active' onClick={() => stateChange(1)}> <i className="h">Select</i> Category
                        <span className='timeLine1 active'></span>
                    </span>
                    <span className='timeLine2'> <i className="h">Select</i> Sub-Category
                        <span className='timeLine2'></span>
                    </span>
                    <span className='timeLine3'> <i className="h">Add</i> Product
                        <span className='timeLine3'></span>
                    </span>
                    <span className='timeLine4'>General
                        <span className='timeLine4'></span>
                    </span>
                </div>
            </div>
        </>
    );
}

export default VProTimeLine;
