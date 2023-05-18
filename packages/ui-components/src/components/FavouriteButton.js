/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import IconButton from '@material-ui/core/IconButton';

import PropTypes from 'prop-types';

export const FavouriteButton = ({ isFavourite, onChange, color, isDisabled }) => (
  <IconButton
    color={color}
    disableRipple
    size="small"
    aria-label="favourite-icon"
    onClick={onChange}
    disabled={isDisabled}
  >
    {isFavourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
  </IconButton>
);

FavouriteButton.propTypes = {
  isFavourite: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  color: PropTypes.string,
  isDisabled: PropTypes.bool,
};

FavouriteButton.defaultProps = {
  isFavourite: false,
  color: 'primary',
  isDisabled: false,
};
