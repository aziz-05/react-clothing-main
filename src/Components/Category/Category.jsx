import React, { Component } from 'react'
import { connect } from 'react-redux';
import styled from 'styled-components';
import { fetchProductsByCategory } from '../../Store/redux/reducers/categories';
import PLP from '../Category/PLP';

const Wrap = styled.div`
    background:#FFF;
    padding-top: 80px ;
    padding-left: 80px ;
    padding-right: 80px ;
    padding-bottom: 80px ;
`

const Heading = styled.h2`
    text-transform:capitalize ;
    padding-top: 40px;
    padding-bottom: 40px;
    font-weight: 400;
    size: 42px;
    `;

class Category extends Component {

  componentDidMount(){
    if(!this.props.match.params.category){
      this.props.fetchProductsByCategory(this.props.category);
    }else{
      this.props.fetchProductsByCategory(this.props.match.params.category);
    }
  }
  
  render() {
        if( this.props.categories.loadingCategory==='pending' ){
          return (
            <div className="loading">
              <div className="loader"></div>
            </div>
            )
        }
        if( this.props.categories.loadingCategory==='succeeded' ){
        return (
        <Wrap>
          <Heading>{this.props.categories.loadedCategory.name}</Heading>
          <PLP />
        </Wrap>
        )}
  }
};

const mapStateToProps = (state, props) => {
  return {
    categories: state.categories,
  };
};

export default connect(mapStateToProps, {fetchProductsByCategory})(Category);