/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { IconButton } from '@material-ui/core';
import { AlertsPanelContext } from '../../../containers';

export const AlertMenuCell = React.memo(({ organisationUnit, period, syndromeName }) => {
  const { setIsOpen, setData } = useContext(AlertsPanelContext);
  const data = { organisationUnit, period, syndromeName };

  const handleClick = useCallback(() => {
    setData(data);
    setIsOpen(true);
  }, [data, setData, setIsOpen]);

  return (
    <IconButton onClick={handleClick}>
      <MoreVertIcon />
    </IconButton>
  );
});

AlertMenuCell.propTypes = {
  organisationUnit: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  syndromeName: PropTypes.string.isRequired,
};
