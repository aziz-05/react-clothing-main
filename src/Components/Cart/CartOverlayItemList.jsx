import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import CartOverlayItem from "./CartOverlayItem";

const ScrollContainer = styled.div`
  overflow-y: scroll;
  max-height: 45vh;
  padding-left: 18px;
  padding-right: 9px;
`;

const ScrollableOverlay = styled.div`
`;

const Item = styled.div`
  padding-top: 42px;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
`;

const Subheading = styled.h4`
  font-size: 16px;
  font-weight: 500;
  padding-bottom: 8px;
  flex:6 ;
`;
class CartOverlayItemList extends Component {
  render() {
    return (
        <ScrollContainer>
          <ScrollableOverlay>
            {!this.props.cart.products.length && (
              <Item>
                <Subheading>NO ITEMS IN CART</Subheading>
              </Item>
            )}
            {this.props.cart.products &&
              this.props.cart.products.map((item, i) => {
                return <CartOverlayItem product={item} key={i} />;
            })}
          </ScrollableOverlay>
        </ScrollContainer>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    cart: state.cart,
  };
};

export default connect(mapStateToProps, null)(CartOverlayItemList);
