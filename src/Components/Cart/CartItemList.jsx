import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { ReactComponent as CartIcon } from "./../../Assets/cartblack.svg";
import CartItem from "./CartItem";

const Item = styled.div`
  border-top: solid 1px #e5e5e5;
  padding-top: 30px;
  padding-bottom: 30px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
`;

const CartIconStyled = styled(CartIcon)`
  display: block;
  color: green;
  text-align: center;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
`;

const EmptyHeading = styled.h1`
  text-transform: capitalize;
  padding-top: 20px;
  font-weight: 700;
  size: 32px;
  text-align:center ;
`;

class CartItemList extends Component {
  render() {
    return(
    <>
        {!this.props.cart.products.length && (
          <Item>
            <CartIconStyled />
            <EmptyHeading>NO ITEMS IN CART</EmptyHeading>
          </Item>
        )}
        {this.props.cart.products &&
          this.props.cart.products.map((item, i) => {
            return <CartItem product={item} key={i} />;
        })}
    </>)
  }
}

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart,
  };
};

export default connect(mapStateToProps,null)(CartItemList);
