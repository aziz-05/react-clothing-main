import React, { Component } from 'react'
import styled from 'styled-components';

const Images = styled.div`
  display: flex ;
  flex-direction:column ;
  align-items:flex-start ;
  flex-grow:1 ;
`

const ImagesItem = styled.img`
  max-width:80px;
  max-height:80px;
  padding-bottom:20px;
  /* object-fit:scale-down ; */
  &:active{
    opacity: 0.3;
  }
  &:hover{
    opacity: 0.7;
  }
`

const ProductImage = styled.img`
  max-width:600px;
  max-height:500px;
  object-fit:scale-down ;
`
const ImageContainer = styled.div`
  position: relative;
  text-align: center;
  flex-grow:4 ;
  color: white;
`

const ProductOutOfStockCard = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  padding: 0.5rem;
  background-color: #FFF;
  &:hover{
    box-shadow: 0px 4px 35px rgba(168, 172, 176, 0.19);
  }
  opacity:50% ;
`;

const OutOfStockText = styled.p`
  font-size:24px ;
  font-weight:400 ;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

class ProductImageSection extends Component {
    state = {
        currentImage: this.props.gallery[0],
    };

    render() {
        return (
            <>
            <Images>
                {this.props.gallery.map((item, i) => {
                return (
                    <ImagesItem
                    activeClassName="selected"
                    key={item}
                    src={item}
                    onClick={() => {
                        this.setState((state) => {
                            return { currentImage: item };
                        });
                    }}
                    />
                );
                })}
            </Images>
              <ImageContainer>
                {!this.props.inStock&&
                <ProductOutOfStockCard>
                      <ProductImage src={this.state.currentImage} />
                      <OutOfStockText>OUT OF STOCK</OutOfStockText>
                </ProductOutOfStockCard>}
                {this.props.inStock&&
                      <ProductImage src={this.state.currentImage} />
                }
              </ImageContainer>
            </>
        );
        }
    }

export default ProductImageSection;