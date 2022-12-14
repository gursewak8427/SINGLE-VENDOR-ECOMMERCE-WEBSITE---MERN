import React from 'react';
import { Redirect, Link } from 'react-router-dom'
import axios from 'axios'

import './VHome.css'

function VHome() {
    return (
        <>
            <div className="v-wrapper">
                <div className="design"></div>
                <div className="v-product white">
                    <div className="vHeader">
                        <div className="img">
                            <img src="https://miro.medium.com/max/1400/1*6jWG2WdKhOHvcmf0_o8mNA.gif" alt=""/>
                        </div>
                        <h1>Manage your website</h1>
                        <h2><a target='blank' href='https://drive.google.com/file/d/1orM2jezcnPLhEb3O8dG74WuQmedAEJOW/view'>Documentation</a></h2>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VHome;
