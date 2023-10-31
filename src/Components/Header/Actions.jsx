import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { ReactComponent as CartIcon } from "./../../Assets/cart.svg";
import { fetchCurrencies } from "../../Store/redux/reducers/currencies";
import { setShowCurrency } from "../../Store/redux/reducers/currencies";
import { setShowCart } from "../../Store/redux/reducers/cart";
import CurrencySwitcher from "./CurrencySwitcher";
import CartOverlay from "../Cart/CartOverlay";

const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  z-index: 1;
`;

export const ActionStyle = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  padding: 0 2px;
  z-index: 1;
`;

const CartIconStyled = styled(CartIcon)`
  display: block;
  text-align: center;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const CartCounter = styled.button`
  border: none;
  font: inherit;
  color: #fff;
  background-color: black;
  cursor: pointer;
  position: absolute;
  bottom: 12px;
  height: 24px;
  width: 24px;
  left: 22px;
  border-radius: 100%;
  display: inline-flex;
  text-align: center;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  z-index: 1;
`;

/* The container <div> - needed to position the dropdown content */
const CartItems = styled.div`
  display: block;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 325px;
  min-height: 150px;
  max-height: 500px;
  max-width: auto;
  z-index: 1;
  top: 38px;
  left: -324px;
  &:hover {
    display: block;
  }
`;

const CartContainer = styled.div`
  position: relative;
  display: inline - block;
  `;

const OverlayCart = styled.div`
  display: block;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 78px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(57, 55, 72, 0.22);
  z-index: 0;
  cursor: pointer;
`;

const OverlayCurrency = styled.div`
  display: block;
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(57, 55, 72, 0.22);
  z-index: 0;
  cursor: pointer;
  opacity:0;
`;

const CartDrop = styled.button`
  background-color: #fff;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  text-transform: uppercase;
  line-height: 28.8px;
  flex-wrap: nowrap;
  padding: 0 7px;
`;


class Actions extends Component {

  componentDidMount() {
    this.props.fetchCurrencies();
  }

  render() {
      return (
        <ActionContainer>
            <ActionStyle>
                <CurrencySwitcher currencies={this.props.currencies} />
                {this.props.currencies.showCurrency && (
                <OverlayCurrency
                onClick={() => {
                    this.props.setShowCurrency(!this.props.currencies.showCurrency);
                }}
                ></OverlayCurrency>
                )}
            </ActionStyle>
            <ActionStyle>
                <CartDrop
                onClick={() => {
                    this.props.setShowCart(!this.props.cart.showCart);
                    this.props.setShowCurrency(false);
                }}
                >
                <CartIconStyled />
                </CartDrop>
                <CartContainer>
                {this.props.cart.showCart && (
                    <CartItems>
                    <CartOverlay></CartOverlay>
                    </CartItems>
                )}
                </CartContainer>
                {this.props.cart.showCart && (
                <OverlayCart
                    onClick={() => {
                    this.props.setShowCart(!this.props.cart.showCart);
                    }}
                ></OverlayCart>
                )}
                {this.props.cart.counter !== 0 && (
                <CartCounter>{this.props.cart.counter}</CartCounter>
                )}
            </ActionStyle>
        </ActionContainer>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    currencies: state.currencies,
    cart: state.cart,
  };
};
// no-unused-vars
export default connect(mapStateToProps, {
  fetchCurrencies,
  setShowCurrency,
  setShowCart,
})(Actions);
