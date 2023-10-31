import React, { Component } from 'react'
import { connect } from 'react-redux';
import styled from 'styled-components';
import parse from 'html-react-parser'
import { addProductCart } from '../../Store/redux/reducers/cart'
const OrderSection = styled.div`
  padding-top: 30px;
`;

const Description = styled.div`
  max-width: 300px;
  white-space: normal;
  h1 {

  }
`

const AttributeName = styled.p`
    font-family: 'Roboto Condensed', sans-serif;
    font-weight: 700;
    font-size:18px ;
    text-transform:uppercase ;
    margin-bottom:8px ;
`

const PriceValue = styled.p`
    font-weight: 700;
    font-size:24px ;
`

const AddButton = styled.button`
  padding: 16px 32px;
  width: 100%;
  border: none;
  font: inherit;
  color: #fff;
  background-color: ${(props) => (props.disabled ? "#00000036": "#5ece7b")};
  cursor: ${(props) => (props.disabled ? "default": "pointer")};
  margin-bottom: 40px;
  margin-top: 30px;
`;

class ProductOrderSection extends Component {
  render() {
      return (
              <>
                <OrderSection>
                  <AttributeName>PRICE:</AttributeName>
                  <PriceValue>
                    {this.props.currencies.currentCurrency.symbol}
                    {
                      this.props.initProduct.prices.filter(
                        (x) =>
                          x.currency.label ===
                          this.props.currencies.currentCurrency.label
                      )[0].amount
                    }
                  </PriceValue>
                </OrderSection>
                <AddButton
                  disabled={!this.props.initProduct.inStock}
                  onClick={() => {
                    this.props.addProductCart(this.props.product)
                  }}
                >
                  ADD TO CART
                </AddButton>
                <Description>
                  {parse(this.props.initProduct.description)}
                </Description>
              </>
      );
    }
}

const mapStateToProps = (state, props) => {
  return {
    currencies: state.currencies,
    product: state.product,
  };
};

export default connect(mapStateToProps, { addProductCart })(ProductOrderSection);