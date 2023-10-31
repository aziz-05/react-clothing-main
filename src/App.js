import React, { Component } from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";
import Header from './Components/Header/Header';
import { store } from './Store/store';
import {fetchCategories} from './Store/redux/reducers/categories';
import PDP from './Components/Product/PDP';
import Cart from './Components/Cart/Cart';
import Category from './Components/Category/Category';

export default class App extends Component {
    
    componentDidMount() {
      store.dispatch(fetchCategories())
    }
    
    render() {
      if (!store.getState().categories.categories) {
        return (
          <div className="loading">
            <div className="loader"></div>
          </div>
      );
      }
      return (
        <Router>
          <div id="root" >
            <Header />
            <Route exact path="/" to="/products/all" component={props => <Category {...props} category={'all'} />}/>
            <Route exact path="/products/:category"  component={Category} />
            <Route path="/product/:id" component={PDP} />
            <Route path="/cart" component={Cart}/>
          </div>
        </Router>
      )
  }
}