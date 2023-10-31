import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import Navigation from "./Navigation";
import Actions from "./Actions";

const Surface = styled.div`
  display: flex;
  position: fixed;
  min-height: 80px;
  width: 100%;
  align-items: center;
  padding: 0 80px;
  background-color: #fff;
  z-index: 1;
`;

const Logo = styled.div`
  display: flex;
  justify-content: center;
  z-index: 1;
`;

class Header extends Component {

  render() {
    if (this.props.categories.loading !== "succeeded") {
              return (
                <Surface>
                </Surface>
              );
    }
      return (
        <Surface>
          <Navigation />
          <Logo>
            <img src="/logo.svg" alt="React Clothing" />
          </Logo>
          <Actions />
        </Surface>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    categories: state.categories,
  };
};
// no-unused-vars
export default connect(mapStateToProps, null)(Header);
