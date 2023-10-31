import { createSlice } from '@reduxjs/toolkit'
const initialState = {
    products: [],
    currentCurrency: { label: 'USD', symbol: '$' },
    counter: 0,
    total: 0,
    loading: 'idle' | 'pending' | 'succeeded' | 'failed',
    showCart:false,
}

const computeCartTotal = (products, currencies) => {
    let total = 0;
    if (products.length === 0) {
        return total;
    }
    products.map((product) => {
        total =
            total +
            product.prices.filter(
                (x) => x.currency.label === currencies.label
            )[0].amount *
            product.qte;
        return product;
    });
    return total;
}

const computeQTE = (products) => {
    let counter = 0;
    if (products.length === 0) {
        return counter;
    }
    products.map((product) => {
        counter =
        counter +
            product.qte
        return product;
    });
    return counter;
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addProductCart(state, action) {
            if (state.products.find((p) => p.id === action.payload.product.id && JSON.stringify(p.attributes) === JSON.stringify(action.payload.product.attributes))) {
                state.products.find((p) => p.id === action.payload.product.id && JSON.stringify(p.attributes) === JSON.stringify(action.payload.product.attributes)).qte++
            } else {
                const clone = JSON.parse(JSON.stringify(action.payload));
                clone.product.qte = 1;
                state.products.push({ ...clone.product });
            }
            state.counter++;
            state.total = computeCartTotal(state.products, state.currentCurrency)
        },
        addProductCategory(state, action) {
            if (state.products.find((p) => p.id === action.payload.id && JSON.stringify(p.attributes) === JSON.stringify(action.payload.attributes))) {
                state.products.find((p) => p.id === action.payload.id && JSON.stringify(p.attributes) === JSON.stringify(action.payload.attributes)).qte++
            } else {
                const clone = JSON.parse(JSON.stringify(action.payload));
                clone.qte = 1;
                state.products.push({ ...clone });
            }
            state.counter++;
            state.total = computeCartTotal(state.products, state.currentCurrency)
        },
        increaseProductQte(state, action) {
            state.products.find((p) => p.id === action.payload.id && JSON.stringify(p.attributes) === JSON.stringify(action.payload.attributes)).qte++
            state.counter++;
            state.total = computeCartTotal(state.products, state.currentCurrency)
        },
        decreaseProductQte(state, action) {
            if (state.products.find((p) => p.id === action.payload.id && JSON.stringify(p.attributes) === JSON.stringify(action.payload.attributes)).qte > 0) {
                state.products.find((p) => p.id === action.payload.id && JSON.stringify(p.attributes) === JSON.stringify(action.payload.attributes)).qte--;
                state.counter--;
                state.total = computeCartTotal(state.products, state.currentCurrency)
            };
        },
        setCartCurrency(state, action) {
            state.currentCurrency = action.payload;
            state.total = computeCartTotal(state.products, state.currentCurrency)
        },
        setShowCart(state, action) {
            state.showCart = action.payload;
        },
        onCheckout(state, action) {
            state.products = initialState.products;
            state.counter = initialState.counter;
            state.loading = initialState.loading;
            state.total = initialState.total;
            state.showCart = initialState.showCart;
        },
    },
    extraReducers: {
        'cart/removeProductCart': (state, action) => {
            state.products = state.products.filter((p)=> p.id!==action.payload.id || JSON.stringify(p.attributes) !== JSON.stringify(action.payload.attributes))
            state.counter = computeQTE(state.products);
            state.total = computeCartTotal(state.products, state.currentCurrency);
        },
    },
})

export const { removeProductCart, addProductCart, addProductCategory, increaseProductQte, decreaseProductQte, setCartCurrency, setShowCart, onCheckout} = cartSlice.actions

export default cartSlice.reducer;