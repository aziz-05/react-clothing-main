import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { onCheckout } from "../../Store/redux/reducers/cart";

const Order = styled.div`
  border-top: solid 1px #e5e5e5;
  padding-top: 32px;
`;

const OrderButton = styled.button`
  padding: 16px, 32px, 16px, 32px;
  border: none;
  height: 43px;
  width: 279px;
  font: inherit;
  color: #fff;
  background-color: #5ece7b;
  cursor: pointer;
  margin-top:16px ;
`;

const OrderInfo = styled.div`
  display: flex;
  padding-top:8px ;
`;

const Stat = styled.h4`
  font-size: 24px;
  font-weight: 500;
  width: 125px;
`;

const StateValue = styled.h4`
  font-size: 24px;
  font-weight: 700;
`;

class CartOrderStats extends Component {

  state = {
    total: this.props.cart.total,
    tax: 0,
  };

  render() {
    return (
      <>
        <Order>
        <OrderInfo>
          <Stat>Tax 21%: </Stat>
          <StateValue>
            {this.props.currencies.currentCurrency.symbol}{" "}
            {((this.props.cart.total * 21) / 100).toFixed(2)}
          </StateValue>
        </OrderInfo>

        <OrderInfo>
          <Stat>Quantity: </Stat>
          <StateValue>{this.props.cart.counter}</StateValue>
        </OrderInfo>

        <OrderInfo>
          <Stat>Total: </Stat>
          <StateValue>
            {this.props.currencies.currentCurrency.symbol}
            {this.props.cart.total.toFixed(2)}
          </StateValue>
        </OrderInfo>

        <OrderButton onClick={() => this.props.onCheckout()}>
          ORDER
        </OrderButton>
        </Order>

      </>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    currencies: state.currencies,
    cart: state.cart,
  };
};

export default connect(mapStateToProps, { onCheckout })(CartOrderStats);
