import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import AttributeList from "./AttributeList";
const Order = styled.div``;

const OrderSection = styled.div``;

const Heading = styled.h1.attrs((props: { small: boolean }) => props)`
  font-size: ${(props) => (props.small ? "16px" : "30px")};
  font-weight: ${(props) => (props.small ? 300 : 600)};
  padding-bottom: 10px;
  white-space: pre;
`;

const Subheading = styled.h1.attrs((props: { small: boolean }) => props)`
  font-size: ${(props) => (props.small ? "16px" : "30px")};
  font-weight: ${(props) => (props.small ? 300 : 400)};
  padding-bottom: 10px;
  white-space: pre;
`;

const PriceValue = styled.p.attrs((props: { small: boolean }) => props)`
  font-size: ${(props) => (props.small ? "16px" : "24px")};
  font-weight: ${(props) => (props.small ? 500 : 700)};
  padding-bottom: 10px;
`;

class ProductDetails extends Component {
  render() {
    return (
      <Order>
        <OrderSection>
          <Heading small={this.props.small}>{this.props.product.brand}</Heading>
          <Subheading small={this.props.small}>
            {this.props.product.name}
          </Subheading>
          {this.props.isCart && (
            <PriceValue small={this.props.small}>
              {this.props.currencies.currentCurrency.symbol}
              {
                this.props.product.prices.filter(
                  (x) =>
                    x.currency.label ===
                    this.props.currencies.currentCurrency.label
                )[0].amount
              }
            </PriceValue>
          )}
        </OrderSection>
        <AttributeList 
              attributes={this.props.product.attributes}
              isCart={this.props.isCart}
              inStock={this.props.inStock}
              small={this.props.small} 
        />
        {this.props.pricePDP}
      </Order>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    currencies: state.currencies,
    cart: state.cart,
  };
};

export default connect(mapStateToProps, null)(ProductDetails);
