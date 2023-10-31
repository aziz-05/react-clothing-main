import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { NavLink } from "react-router-dom/cjs/react-router-dom";
import { fetchProductsByCategory } from '../../Store/redux/reducers/categories';

const Nav = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  z-index: 1;
  p {
    font-weight: 600, Medium;
    size: 16px;
    text-transform: uppercase;
    padding: 0 15px;
    line-height: 19.2px;
    flex-wrap: nowrap;
    &.active {
      border-bottom: 5px solid red;
    }
  }
`;

const ItemLink = styled(NavLink)`
  font-weight: 400;
  size: 16px;
  text-transform: uppercase;
  padding: 10px 15px 10px 15px;
  line-height: 57.2px;
  flex-wrap: nowrap;
  padding-bottom: 10px;
  z-index: 1;
`;

class Navigation extends Component {

    render() {
      return (
          <Nav>
            {this.props.categories.loading === "succeeded" &&
              this.props.categories.categories.map((item, i) => {
                return (
                  <ItemLink
                    activeClassName="selected"
                    key={i}
                    onClick={()=>this.props.fetchProductsByCategory(item.name)}
                    to={`/products/${item.name}`}
                  >
                    {item.name}
                  </ItemLink>
                );
              })}
          </Nav>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    categories: state.categories,
  };
};

export default connect(mapStateToProps, {
  fetchProductsByCategory
})(Navigation);
