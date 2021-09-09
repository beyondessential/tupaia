import React from 'react';
import PropTypes from 'prop-types';

const Slide = ({ url }) => (
  <div className="slide" style={styles.container}>
    <img src={url} alt="slideImage" style={styles.img} />
  </div>
);

Slide.propTypes = {
  url: PropTypes.string.isRequired,
};

const styles = {
  img: { width: '100%', height: 'auto' },
  container: {
    overflowY: 'hidden',
  },
};

export default Slide;
