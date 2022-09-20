/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ListVisual as ListVisualComponent } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import { VisualHeader } from './VisualHeader';
import { FavouriteButton } from '../FavouriteButton';
import { YearLabel } from '../YearLabel';

export const ListVisual = props => {
  const { name, isEnlarged, isFavourite, handleFavouriteStatusChange, useYearSelector } = props;

  return (
    <>
      {!isEnlarged && (
        <VisualHeader name={name}>
          <YearLabel useYearSelector={useYearSelector} />
          <FavouriteButton
            isFavourite={isFavourite}
            handleFavouriteStatusChange={handleFavouriteStatusChange}
          />
        </VisualHeader>
      )}
      <ListVisualComponent {...props} />
    </>
  );
};

ListVisual.propTypes = {
  isEnlarged: PropTypes.bool,
  useYearSelector: PropTypes.bool,
  name: PropTypes.string,
  isFavourite: PropTypes.bool.isRequired,
  handleFavouriteStatusChange: PropTypes.func,
};

ListVisual.defaultProps = {
  isEnlarged: false,
  useYearSelector: false,
  name: null,
  handleFavouriteStatusChange: () => {},
};
