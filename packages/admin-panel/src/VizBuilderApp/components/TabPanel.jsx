import React from 'react';
import PropTypes from 'prop-types';

export const TabPanel = React.memo(({ children, isSelected, Panel }) => {
  if (!isSelected) {
    return null;
  }
  return <Panel>{children}</Panel>;
});

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  isSelected: PropTypes.bool,
  Panel: PropTypes.node,
};

TabPanel.defaultProps = {
  isSelected: false,
  Panel: () => <div />,
};
