import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';

const arrowStyle = {
  fontSize: '2rem',
  position: 'absolute',
  top: 'calc(50% - 60px)',
  opacity: '0.7',
  cursor: 'pointer',
  ':hover': {
    opacity: '0.3',
  },
};

const Arrow = ({ handleClick, Icon, style, tabIndex }) => (
  <div
    style={[style, arrowStyle]}
    onClick={handleClick}
    onKeyPress={handleClick}
    role="button"
    tabIndex={tabIndex}
  >
    {Icon}
  </div>
);

Arrow.propTypes = {
  handleClick: PropTypes.func.isRequired,
  Icon: PropTypes.element.isRequired,
  style: PropTypes.shape({
    left: PropTypes.string,
    right: PropTypes.string,
  }),
  tabIndex: PropTypes.number,
};

Arrow.defaultProps = {
  style: {},
  tabIndex: 0,
};

export default Radium(Arrow);
