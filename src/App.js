import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from 'react-router-dom';
import { useStateValue } from './StateProvider/StateProvider.js';
import axios from 'axios'
import { getTokenUser, getTokenAdmin, setLocalStorage } from './helpers/auth';

// User Components
import NavBar from './sources/user/common/NavBar.jsx'
import SideBar from './sources/user/common/SideBar.jsx'
import Footer from './sources/user/common/Footer.jsx'
import Home from './sources/user/Home.jsx'
import Cart from './sources/user/Cart.jsx'
import Signup from './sources/user/common/Signup.jsx'
import Orders from './sources/user/Orders.jsx'
import Payment from './sources/user/payments/Payment.jsx'
import ProductDetail from './sources/user/ProductDetail.jsx'
import Category from './sources/user/Category.jsx'
import Profile from './sources/user/Profile.jsx';
import Search from './sources/user/Search.jsx';
import ShortLoading from './sources/user/ShortLoading.jsx';
import Bill from './sources/user/common/BIll.jsx';

// Vendor Components
import VHome from './sources/vendor/VHome.jsx'
import VNavbar from './sources/vendor/common/VNavbar.jsx'
import VSidebar from './sources/vendor/common/VSidebar.jsx'
import VLogin from './sources/vendor/VLogin.jsx'
import VProfile from './sources/vendor/VProfile.jsx'
import VProduct from './sources/vendor/VProduct.jsx'
import VAttributes from './sources/vendor/productComponents/VAttributes.jsx'
import VManage from './sources/vendor/VManage.jsx'
import VOrders from './sources/vendor/VOrders.jsx'
import VSlider from './sources/vendor/VSlider.jsx'
import VBill from './sources/vendor/common/VBIll.jsx';
import { KEYS } from './sources/keys.js';
import { useState } from 'react';

function App({ props }) {
  const [store, dispatch] = useStateValue();
  const [pageLoding, setPageLoading] = useState(true);
  const userToken = getTokenUser()
  const adminToken = getTokenAdmin()

  useEffect(() => {
    if (store.user == "" || store.user == undefined) {
      if (userToken) {
        axios.post(`${KEYS.NODE_URL}/api/user/auth/156/checkUserToken`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `barear ${userToken}`
            }
          }
        )
          .then(result => {
            dispatch({
              type: 'SET_USER',
              data: result.data.user,
            })
            setPageLoading(false)
          }).catch(err => {
            console.log('imhere...dfd-err 1', err)
            setPageLoading(false)
          })
      }
    } else {

    }

    if (adminToken) {
      if (window.location.href.split("/")[window.location.href.split("/").length - 1] == "login") {
        window.location.href = "/vendor/"
        return;
      }
    }

    // console.log(window.location.href.split("/")[window.location.href.split("/").length - 1])
    if ((store.admin == "" || store.admin == undefined) && window.location.href.split("/")[window.location.href.split("/").length - 1] != "login" && window.location.href.split("/")[window.location.href.split("/").length - 2] == "vendor") {
      if (adminToken) {
        axios.post(`${KEYS.NODE_URL}/api/vendor/156/checkAdminToken`, {},
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `barear ${adminToken}`
            }
          })
          .then(result => {
            dispatch({
              type: 'SET_ADMIN',
              data: result.data.user
            })

          }).catch(err => {
            console.log('imhere...dfd-err 2', err)

          })
      } else {

        console.log("Redirect")
        window.location.href = '/vendor/login'
      }
    } else {

    }
  }, [])

  // axios.interceptors.request.use(
  //   config => {
  //     config.headers.authorization = `Bearer ${userToken}`;
  //     return config;
  //   },
  //   error => {
  //     return Promise.reject(error);
  //   }
  // )

  return (
    <>
      {pageLoding ? <>Page Loading...</> :
        <>
          {store.loading ? <div className="overlayStrong"></div> : null}
          {store.navLoading ? <div className="overlayStrong"></div> : null}
          <Router>
            <Switch>
              <Route path='/vendor'>
                <Switch>
                  <Route path='/vendor/login' exact render={props => <VLogin {...props} />} />
                  <Switch>
                    <Route path='/vendor/orders/billing' exact render={props => <VBill {...props} />} />
                    <Route>
                      <VNavbar />
                      <VSidebar />
                      <Switch>
                        <Route path='/vendor' exact render={props => <VHome {...props} />} />
                        <Route path='/vendor/dashboard' exact render={props => <VHome {...props} />} />
                        <Route path='/vendor/profile' exact render={props => <VProfile {...props} />} />
                        <Route path='/vendor/product' exact render={props => <VProduct {...props} />} />
                        <Route path='/vendor/product/:id' exact render={props => <VProduct {...props} />} />
                        <Route path='/vendor/attr' exact render={props => <VAttributes {...props} />} />
                        <Route path='/vendor/manage' exact render={props => <VManage {...props} />} />
                        <Route path='/vendor/orders' exact render={props => <VOrders {...props} />} />
                        <Route path='/vendor/general/sliders' exact render={props => <VSlider {...props} />} />
                      </Switch>
                    </Route>
                  </Switch>
                </Switch>
              </Route>
              <Route path='/'>
                <Switch>
                  <Route path='/orders/bill' exact render={props => <Bill {...props} />} />
                  <Route>
                    <ShortLoading />
                    <NavBar />
                    <Signup />
                    <SideBar />
                    <Switch>
                      <Route path='/' exact render={props => <Home {...props} />} />
                      <Route path='/search/:searchItem' exact render={props => <Search {...props} />} />
                      <Route path='/profile' exact render={props => <Profile {...props} />} />
                      <Route path='/cart' exact render={props => <Cart {...props} />} />
                      <Route path='/orders' exact render={props => <Orders {...props} />} />
                      <Route path='/payment/:orderId' exact render={props => <Payment {...props} />} />
                      <Route path='/item/info/:productId' exact render={props => <ProductDetail {...props} />} />
                      <Route path='/c/:cat/:subCat' exact render={props => <Category {...props} />} />
                    </Switch>
                    <Footer />
                  </Route>
                </Switch>
              </Route>
            </Switch>
          </Router>
        </>
      }
    </>
  );
}

export default App;
