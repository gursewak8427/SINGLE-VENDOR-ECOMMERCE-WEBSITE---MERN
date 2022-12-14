export const initialState = {
    user: '',
    admin: '',
    rawdata: [],
    home_products: [],
    cart: [],
    cartTotal: 0,
    cart_pending: '',
    attributes: [],
    orders: [],
    vendorOrders: [],
    currentOrder: [],
    sliderList: [],
    searchItem: '',
    loading: false,
    navLoading: false,
    currentInvoice: '',
    notifyList: [],
    newNotify: 0
};

const reducer = (store, action) => {
    // console.log(action)
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...store,
                loading: true
            }

        case 'UNSET_LOADING':
            return {
                ...store,
                loading: false
            }

        case 'SET_NEWNOTIFY':
            return {
                ...store,
                newNotify: action.number
            }

        case 'SET_NAVLOADING':
            return {
                ...store,
                navLoading: true
            }

        case 'UNSET_NAVLOADING':
            return {
                ...store,
                navLoading: false
            }

        case 'SET_USER':
            return {
                ...store,
                user: action.data
            }

        case 'UNSET_USER':
            return {
                ...store,
                user: '',
                cart: [],
                cartTotal: 0,
                cart_pending: '',
                orders: [],
                currentOrder: [],
            }

        case 'SET_ADMIN':
            return {
                ...store,
                user: action.data
            }

        case 'UNSET_ADMIN':
            return {
                ...store,
                admin: '',
            }

        case 'CURRENT_INVOICE':
            console.log(action.order)
            return {
                ...store,
                currentInvoice: action.order
            }

        case 'ADD_TO_CART':
            {
                var price = 0
                if (action.item.productType == 0) {
                    price = store.cartTotal + parseFloat(action.item.price.price) * parseFloat(action.item.itemQty)
                } else if (action.item.productType == 1) {
                    price = store.cartTotal + parseFloat(action.item.varient.general.price) * parseFloat(action.item.itemQty)
                }
                return {
                    ...store,
                    cart: [action.item, ...store.cart],
                    cartTotal: price
                }
            }


        case 'SET_CART':
            {
                var price = 0
                action.items.map(item => (
                    item.productType == 0 ?
                        price += parseFloat(item.price.price) * parseFloat(item.itemQty)
                        : item.productType == 1 ?
                            price += parseFloat(item.varient.general.price) * parseFloat(item.itemQty)
                            : price += 0
                ))
                return {
                    ...store,
                    cart: action.items,
                    cartTotal: price
                }


            }

        case 'CART_PENDING':
            // console.log('store', action.item)
            return {
                ...store,
                cart_pending: action.item
            }


        case 'ADD_TO_ORDERS':
            return {
                ...store,
                orders: [action.cart, ...store.orders]
            }

        case 'SET_ORDERS':
            console.log(action.orders)
            return {
                ...store,
                orders: action.orders
            }

        case 'SET_SEARCH_ITEM':
            return {
                ...store,
                searchItem: action.item
            }

        case 'SET_SLIDERS':
            return {
                ...store,
                sliderList: action.sliders
            }

        case 'SET_CURRENT_ORDER':
            return {
                ...store,
                currentOrder: action.order
            }

        case 'SET_VORDERS':
            return {
                ...store,
                vendorOrders: action.orders
            }


        case 'ADD_TO_RAWDATA':
            return {
                ...store,
                rawdata: action.data
            }

        case 'SET_ATTR':
            return {
                ...store,
                attributes: action.data
            }

        case 'ADD_TO_HOME_PRODUCTS':
            return {
                ...store,
                home_products: [...store.home_products, action.data.products]
            }


        case 'SET_NOTIFY':
            return {
                ...store,
                notifyList: action.notifyList
            }


        default:
            return store
    }
}

export default reducer