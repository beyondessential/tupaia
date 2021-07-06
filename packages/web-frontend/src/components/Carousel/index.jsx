import React from 'react';
import PropTypes from 'prop-types';
import Left from '@material-ui/icons/ChevronLeft';
import Right from '@material-ui/icons/ChevronRight';

import { OFF_WHITE } from '../../styles';

import Slide from './Slide';
import Arrow from './Arrow';

const slideStyle = {
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  flexDirection: 'row',
  display: 'flex',
};

const iconStyle = {
  height: '120px',
  width: '120px',
  color: OFF_WHITE,
};

class Carousel extends React.Component {
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      imageIndex: 0,
    };
  }

  previousImage = () => {
    this.setState(currentState => {
      const { imageIndex } = currentState;
      const newIndex = imageIndex === 0 ? this.props.images.length - 1 : imageIndex - 1;
      return {
        imageIndex: newIndex,
      };
    });
  };

  nextImage = () => {
    this.setState(currentState => {
      const { imageIndex } = currentState;
      const newIndex = imageIndex === this.props.images.length - 1 ? 0 : imageIndex + 1;
      return {
        imageIndex: newIndex,
      };
    });
  };

  render() {
    const currentIndex = this.state.imageIndex;
    const { images } = this.props;

    return (
      <div className="carousel" style={slideStyle}>
        <Arrow
          Icon={<Left style={iconStyle} />}
          handleClick={this.previousImage}
          style={{
            left: '1rem',
          }}
          tabIndex={0}
        />

        <Slide url={images[currentIndex]} />

        <Arrow
          Icon={<Right style={iconStyle} />}
          handleClick={this.nextImage}
          style={{
            right: '1rem',
          }}
          tabIndex={-1}
        />
      </div>
    );
  }
}

export default Carousel;
