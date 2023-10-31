import React, { Component } from "react";
import styled from "styled-components";
import ProductDetails from "../Product/ProductDetails";
import ProductQuantity from "../Product/ProductQuantity";
import ItemImageSection from "./ItemImageSection";

const Item = styled.div`
  border-top: solid 1px #e5e5e5;
  padding-top: 32px;
`;

const Grid = styled.div``;

const Row = styled.div`
  display: flex;
  padding-bottom: 30px;
`;

const Details = styled.div`
  flex: 5;
`;

class CartItem extends Component {

  render() {
    return (
      <Item>
        <Grid>
          <Row>
            <Details><ProductDetails product={this.props.product} isCart={true} small={false}/></Details>
            <ProductQuantity product={this.props.product} small={false} />
            <ItemImageSection gallery={this.props.product.gallery} />
          </Row>
        </Grid>
      </Item>
    );
  }
}

export default CartItem;
