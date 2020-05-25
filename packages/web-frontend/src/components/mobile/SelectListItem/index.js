/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darken } from 'polished';

import SelectIcon from 'material-ui/svg-icons/navigation/chevron-right';
import { delayMobileTapCallback } from '../../../utils';
import { LIGHT_GREY, WHITE } from '../../../styles';

const ListItem = styled.button`
  background: ${WHITE};
  color: #000;
  display: flex;
  width: 100%;
  border: none;
  border-top: 1px solid ${LIGHT_GREY};
  padding: 10px 0;
  justify-content: space-between;
  &:active {
    background: ${darken(0.2, WHITE)};
    width: 108%;
    left: -3%;
    padding-left: 3%;
    position: relative;
    padding-right: 5%;
  }
`;

const Title = styled.div`
  align-self: center;
`;

const ListItemSubTitle = styled(Title)`
  margin-left: auto;
  font-size: 14px;
`;

export const SelectListItem = ({ onSelect, title, subTitle, orgUnitCode }) => {
  return (
    <ListItem onClick={() => delayMobileTapCallback(() => onSelect(orgUnitCode))}>
      <Title>{title}</Title>
      {subTitle && <ListItemSubTitle>{subTitle}</ListItemSubTitle>}
      <SelectIcon color="#000" />
    </ListItem>
  );
};

SelectListItem.propTypes = {
  onSelect: PropTypes.func,
  orgUnitCode: PropTypes.string,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  color: PropTypes.string,
  background: PropTypes.string,
};
