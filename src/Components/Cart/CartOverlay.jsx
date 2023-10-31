import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom/cjs/react-router-dom";
import styled from "styled-components";
import { onCheckout } from "../../Store/redux/reducers/cart";
import { setShowCart } from "../../Store/redux/reducers/cart";
import CartOverlayItemList from "./CartOverlayItemList";

const Wrap = styled.div`
  background: #fff;
  padding: 32px 16px;
`;

const OrderInfo = styled.div`
  padding-top: 32px;
  display: flex;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const CartOverlayHeader = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const Total = styled.h4`
  font-size: 16px;
  font-weight: 500;
  padding-bottom: 8px;
  flex:6 ;
`;

const TotalValue = styled.h4`
  font-size: 16px;
  font-weight: 700;
  padding-bottom: 8px;
`;

const BtnGroup = styled.div`
  padding-top: 32px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-between;
`;

const Checkout = styled.button`
  padding: 12px 27px;
  border: none;
  height: 43px;
  width: 140px;
  font: inherit;
  color: #fff;
  background-color: #5ece7b;
  border: 1px solid #5ece7b;
  cursor: pointer;
  font-size: 14px;
`;

const CartLink = styled(NavLink)`
  height: 43px;
  width: 140px;
  font-weight: 700;
  font-size: 14px;
`;

const CheckLink = styled(NavLink)`
  height: 43px;
  width: 140px;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
`;

const ViewBag = styled.button`
  padding: 7px 28px;
  border: none;
  height: 43px;
  width: 140px;
  font: inherit;
  color: #1d1f22;
  border: 1px solid #1d1f22;
  cursor: pointer;
  font-size: 14px;
  background-color: #fff;
`;

class CartOverlay extends Component {
  render() {
    return (
      <Wrap>
        <CartOverlayHeader>
          <TotalValue>My Bag</TotalValue>
          {this.props.cart.counter === 1 && (
            <Total>, {this.props.cart.counter} </Total>
          )}
          {this.props.cart.counter !== 1 && (
            <Total>, {this.props.cart.counter} items</Total>
          )}
        </CartOverlayHeader>

        <CartOverlayItemList />

        <OrderInfo>
          <Total>Total</Total>
          <TotalValue>
            {this.props.currencies.currentCurrency.symbol}
            {this.props.cart.total.toFixed(2)}
          </TotalValue>
        </OrderInfo>

        <BtnGroup>
          <CartLink
            onClick={() => this.props.setShowCart(!this.props.cart.showCart)}
            to={{ pathname: `/cart` }}
          >
            <ViewBag onClick={() => this.props.setShowCart(!this.props.cart.showCart)}>
                VIEW BAG
            </ViewBag>
          </CartLink>
          <Checkout onClick={() => this.props.onCheckout()}>
            <CheckLink
              onClick={(e) => e.preventDefault()}
              to={{ pathname: `#` }}
            >
              CHECK OUT
            </CheckLink>
          </Checkout>
        </BtnGroup>
      </Wrap>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart,
    currencies: state.currencies,
  };
};

export default connect(mapStateToProps, { onCheckout, setShowCart })(CartOverlay);
