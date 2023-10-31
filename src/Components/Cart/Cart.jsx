import React, { Component } from "react";
import styled from "styled-components";
import CartItemList from "./CartItemList";
import CartOrderStats from "./CartOrderStats";

const Wrap = styled.div`
  background: #fff;
  padding-top: 80px;
  padding-left: 80px;
  padding-right: 80px;
  padding-bottom: 80px;
`;

const Heading = styled.h1`
  text-transform: capitalize;
  padding-top: 40px;
  padding-bottom: 40px;
  font-weight: 700;
  size: 42px;
`;


class Cart extends Component {

  render() {
    return (
      <Wrap>
        <Heading>CART</Heading>
        <CartItemList />
        <CartOrderStats />
      </Wrap>
    );
  }
}

export default Cart;
