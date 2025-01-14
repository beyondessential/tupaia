import React from 'react';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';

interface FavouriteButtonProps {
  isFavourite?: boolean;
  onChange: () => void;
  color?: IconButtonProps['color'];
  isDisabled?: boolean;
}

export const FavouriteButton = ({
  isFavourite = false,
  onChange,
  color = 'primary',
  isDisabled = false,
}: FavouriteButtonProps) => (
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
