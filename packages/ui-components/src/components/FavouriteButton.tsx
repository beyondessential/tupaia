/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React, { FC, ReactElement } from 'react';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import IconButton from '@material-ui/core/IconButton';

export const FavouriteButton: FC<{
  isFavourite?: boolean;
  onChange: () => void;
  color?: 'primary' | 'secondary' | 'inherit' | 'default';
  isDisabled?: boolean;
}> = ({ isFavourite = false, onChange, color = 'primary', isDisabled = false }): ReactElement => (
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
