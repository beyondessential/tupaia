/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import RoomIcon from '@material-ui/icons/Room';
import { SelectList } from '../../../components';

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin-top: 0.9rem;
`;

export const ResultItem = ({ name, parentName }) => {
  return (
    <>
      {name} | <span className="text-secondary">{parentName}</span>
    </>
  );
};

export const ResultsList = ({ value, searchResults, onSelect }) => {
  const displayResults = searchResults?.map(({ name, parentName, code, id }) => ({
    content: <ResultItem name={name} parentName={parentName} />,
    value: id,
    code,
    selected: id === value,
    icon: <RoomIcon />,
    button: true,
  }));
  return (
    <ListWrapper>
      <SelectList items={displayResults} onSelect={onSelect} variant="fullPage" />
    </ListWrapper>
  );
};
