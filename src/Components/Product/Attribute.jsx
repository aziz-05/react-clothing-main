import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { store } from "../../Store/store";
import { setProduct } from "../../Store/redux/reducers/product";

const OrderSection = styled.div`
    padding-top: 10px ;
`;

const AttributeName = styled.p.attrs((props: { small: boolean }) => props)`
  font-family: "Roboto Condensed", sans-serif;
  font-weight: ${(props) => (props.small ? 400 : 700)};
  font-size: ${(props) => (props.small ? "14px" : "18px")};
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const Items = styled.div``;

const Item = styled.button.attrs(
  (props: { selected: boolean, disabled: boolean, small: boolean, capacity: boolean }) => props
)`
  background: none;
  padding: 0;
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  outline: inherit;
  width: ${(props) => (props.small ? (props.capacity ? "40px" : "24px") : "63px")};
  height: ${(props) => (props.small ? "24px" : "45px")};
  border: 1px solid black;
  color: ${(props) => (props.selected ? "white" : "black")};
  background-color: ${(props) => (props.selected ? "black" : "white")};
  opacity: ${(props) => (props.disabled ? 0.8 : 1)};
  font-family: "Source Sans Pro", sans-serif;
  font-size: ${(props) => (props.small ? "14px" : "16px")};
  font-weight: 400;
  margin-right: 12px;
  &:hover {
    color: ${(props) => props.disabled ? (props.selected ? "white" : "black") : "white"};
    background-color: ${(props) => props.disabled ? (props.selected ? "black" : "white") : "black"};
  }
`;

const Swatch = styled.button.attrs(
  (props: {
    selected: boolean,
    disabled: boolean,
    color: string,
    small: boolean,
  }) => props
)`
  background: none;
  padding: 0;
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  outline: inherit;
  width: ${(props) => (props.small ? "16px" : "32px")};
  height: ${(props) => (props.small ? "16px" : "32px")};
  border: 1px solid white;
  outline: ${(props) => (props.selected ? "1px solid #5ECE7B" : "none")};
  opacity: ${(props) => (props.disabled ? 0.8 : 1)};
  background-color: ${(props) => props.color};
  font-family: "Source Sans Pro", sans-serif;
  font-size: ${(props) => (props.small ? "14px" : "16px")};
  font-weight: 400;
  margin-right: 12px;
`;

class Attribute extends Component {
  state = {
    selectedAttribute: {
      id: this.props.attribute.id,
      displayValue: this.props.attribute.items[0].displayValue,
      value: this.props.attribute.items[0].value,
    },
    attribute: this.props.attribute,
  };

  selectAttribute = (id, attribute) => {
    const clone = JSON.parse(JSON.stringify(attribute));
    clone.items.map((l, index) => {
      return l.id === id ? (l.selected = true) : (l.selected = false);
    });
    return clone;
  }
  
  updateProductAttribute = (updatedAttribute, product) => {
    const clone = JSON.parse(JSON.stringify(product));
    clone.attributes.map((attribute) => {
      if (attribute.id === updatedAttribute.id) {
        attribute.items = updatedAttribute.items;
      }
      return attribute;
    });
    return clone;
  }

  render() {
    if (this.props.attribute.type === "swatch") {
        return (
            <OrderSection>
            <AttributeName small={this.props.small}>
                {this.props.attribute.name}:
            </AttributeName>
            <Items>
                {this.props.attribute.items.map((item, i) => {
                return (
                    <Swatch
                    small={this.props.small}
                    key={item.id}
                    onClick={() => {
                        store.dispatch(
                        setProduct(
                            this.updateProductAttribute(
                            this.selectAttribute(item.id, this.state.attribute),
                            this.props.product.product
                            )
                        )
                        );
                        this.setState((state) => {
                        return {
                            selectedAttribute: {
                            id: this.props.attribute.id,
                            displayValue: item.displayValue,
                            value: item.value,
                            },
                            attribute: this.selectAttribute(item.id, state.attribute),
                        };
                        });
                    }}
                    disabled={this.props.isCart && !this.props.inStock}
                    selected={
                        this.props.isCart
                        ? item.selected
                        : item.displayValue ===
                            this.state.selectedAttribute.displayValue
                    }
                    color={item.value}
                    ></Swatch>
                );
                })}
            </Items>
            </OrderSection>
        );
    }
    return (
        <OrderSection>
          <AttributeName small={this.props.small}>{this.props.attribute.name}:</AttributeName>
          <Items>
            {this.props.attribute.items.map((item, i) => {
              return (
                <Item
                  small={this.props.small}
                  key={item.id}
                  onClick={() => {
                    store.dispatch(
                      setProduct(
                        this.updateProductAttribute(
                          this.selectAttribute(item.id, this.state.attribute),
                          this.props.product.product
                        )
                      )
                    );
                    this.setState((state) => {
                      return {
                        selectedAttribute: {
                          id: this.props.attribute.id,
                          displayValue: item.displayValue,
                          value: item.value,
                        },
                        attribute: this.selectAttribute(item.id, state.attribute),
                      };
                    });
                  }}
                  disabled={this.props.isCart && this.props.inStock}
                  capacity={this.props.attribute.id==='Capacity'}
                  selected={
                    this.props.isCart
                      ? item.selected
                      : item.displayValue ===
                        this.state.selectedAttribute.displayValue
                  }
                >
                    {item.value}
                </Item>
              );
            })}
          </Items>
        </OrderSection>
      );
    }
}

const mapStateToProps = (state, props) => {
  return {
    currencies: state.currencies,
    cart: state.cart,
    product: state.product,
  };
};

export default connect(mapStateToProps, { setProduct })(Attribute);
