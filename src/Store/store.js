import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './redux/reducers/categories'
import currenciesReducer from './redux/reducers/currencies'
import productReducer from './redux/reducers/product'
import cartReducer from './redux/reducers/cart'

export const store = configureStore({
  reducer:{
    categories: categoriesReducer,
    product: productReducer,
    currencies: currenciesReducer,
    cart: cartReducer,
  },
});