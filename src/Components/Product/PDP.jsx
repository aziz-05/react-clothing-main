import React, { Component } from 'react'
import { connect } from 'react-redux';
import styled from 'styled-components';
import { addProductCart } from '../../Store/redux/reducers/cart';
import { fetchProductById, setProduct } from "../../Store/redux/reducers/product";
import ProductDetails from './ProductDetails';
import { store } from "../../Store/store";
import ProductImageSection from './ProductImageSection';
import ProductOrderSection from './ProductOrderSection';

const Wrap = styled.div`
    display: flex;
    column-gap:10px;
    justify-content:center;
    background:#FFF;
    padding-top: 120px;
    padding-left: 80px;
    padding-right: 80px;
    padding-bottom: 80px;
`
class PDP extends Component {

  componentDidMount() {
    store.dispatch(fetchProductById(this.props.match.params.id))
  }

  render() {
    if (this.props.product.loading === 'pending') {
      return (
        <div className="loading">
          <div className="loader"></div>
        </div>
      );
    } 
    if(this.props.product.loading === 'succeeded') {
      return (
        <Wrap>
          <ProductImageSection             
            inStock={this.props.product.product.inStock}
            gallery={this.props.product.product.gallery} 
          />
          <ProductDetails
            product={this.props.product.product}
            isCart={false}
            pricePDP={<ProductOrderSection initProduct={this.props.product.product} />}>
          </ProductDetails>
        </Wrap>
      );
    }
  }
};

const mapStateToProps = (state, props) => {
  return {
    categories: state.categories,
    currencies: state.currencies,
    product: state.product,
  };
};

export default connect(mapStateToProps, { addProductCart, setProduct })(PDP);