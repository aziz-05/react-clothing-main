import React, { Component } from "react";
import Attribute from "./Attribute";

class AttributeList extends Component {
  render() {
    return (
      <>
        {this.props.attributes.map((item, i) => {
          return (
            <Attribute
              key={i}
              attribute={item}
              isCart={this.props.isCart}
              inStock={this.props.inStock}
              small={this.props.small}
            />
          );
        })}
      </>
    );
  }
}

export default AttributeList;
