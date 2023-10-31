import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { setCurrency } from "../../Store/redux/reducers/currencies";
import { setCartCurrency } from "../../Store/redux/reducers/cart";
import { setShowCurrency } from "../../Store/redux/reducers/currencies";

const Currency = styled.div`
  font-weight: 500 !important;
  padding: 5px 10px;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
`;

class CurrencyList extends Component {
  render() {
    return (
      <>
        {this.props.currencies.currencies.map((item, i) => {
        // eslint-disable-next-line
        return (
            <Currency
              key={i}
              onClick={() => {
                  this.props.setCurrency(item);
                  this.props.setCartCurrency(item);
                  this.props.setShowCurrency(
                  !this.props.currencies.showCurrency
                  );
              }}
            >
            <a onClick={(e)=>e.preventDefault()} href="/#">
                {item.symbol} {item.label}
            </a>
            <br />
            </Currency>
        );
        })}
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

export default connect(mapStateToProps, {
  setCurrency,
  setCartCurrency,
  setShowCurrency,
})(CurrencyList);
