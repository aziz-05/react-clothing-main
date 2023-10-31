import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import ProductDetails from "../Product/ProductDetails";
import ProductQuantity from "../Product/ProductQuantity";

const Item = styled.div`
  padding-top: 32px;
  white-space: pre;
`;

const Grid = styled.div``;

const Row = styled.div`
  display: flex;
  padding-bottom: 30px;
`;

const Details = styled.div`
  flex: 5;
`;

const Preview = styled.div`
  display: flex;
  flex: 1;
`;

const ProductImage = styled.img`
  max-width: 121px;
  max-height: 190px;
  object-fit: scale-down;
`;

const ImageContainer = styled.div`
  display: flex;
  position: relative;
  text-align: center;
  flex-grow: 4;
  color: white;
  margin-left: 24px;
`;

class CartOverlayItem extends Component {
  state = {
    imageCount: this.props.product.gallery.length,
    counter: 0,
  };
  render() {
    return (
      <Item>
        <Grid>
          <Row>
            <Details>
              <ProductDetails
                product={this.props.product}
                isCart={true}
                small={true}
              />
            </Details>
            <ProductQuantity product={this.props.product} small={true} />
            <Preview>
              <ImageContainer>
                <ProductImage
                  src={this.props.product.gallery[this.state.counter]}
                />
              </ImageContainer>
            </Preview>
          </Row>
        </Grid>
      </Item>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    currencies: state.currencies,
  };
};

export default connect(mapStateToProps, null)(CartOverlayItem);
