/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MultiValueRowWrapper
 *
 * Renders view with comparison or single values with custom labels and colors.
 * Column data is mapped to the matching header in presentationOptions
 * @prop {object} viewContent An object with the following structure
  {
    data: [
      { name: 'Hospital', [LEFT_COLUMN_HEADER]: 0, [MIDDLE_COLUMN_HEADER]: 2, [RIGHT_COLUMN_HEADER]: 0 },
      { name: 'Clinics', [LEFT_COLUMN_HEADER]: 1, [MIDDLE_COLUMN_HEADER]: 8, [RIGHT_COLUMN_HEADER]: 3 },
    ]
    presentationOptions: {
      "leftColumn": {
        "color": "#22c7fc", "header": [LEFT_COLUMN_HEADER]
       },
      "middleColumn": {
        "color": "#aa2bfc", "header": [MIDDLE_COLUMN_HEADER]
       },
      "rightColumn": {
        "color": "#db2222", "header": [RIGHT_COLUMN_HEADER]
       }
    }
  }

 * @return {React Component} a view with 1-3 value(s), with colors and headers
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darkWhite } from '../../styles';

export class MultiValueRowWrapper extends PureComponent {
  render() {
    const { data, presentationOptions, name } = this.props.viewContent;
    const {
      leftColumn: leftOptions,
      middleColumn: middleOptions,
      rightColumn: rightOptions,
      rowHeader,
    } = presentationOptions;

    return (
      <GridContainer>
        <Title>{name}</Title>
        {rowHeader && <NameColumn color={rowHeader.color}>{rowHeader.name}</NameColumn>}
        {leftOptions && leftOptions.header && (
          <Header color={leftOptions.color}>{leftOptions.header}</Header>
        )}
        {middleOptions && middleOptions.header && (
          <Header color={middleOptions.color}>{middleOptions.header}</Header>
        )}
        {rightOptions && rightOptions.header && (
          <Header color={rightOptions.color}>{rightOptions.header}</Header>
        )}
        {data.map(row => {
          return (
            <Row key={row.name}>
              <NameCell color={rowHeader.color}>{row.name}</NameCell>
              {leftOptions !== undefined && (
                <Cell color={leftOptions.color}>
                  <div>{row[leftOptions.header]}</div>{' '}
                  {middleOptions || rightOptions ? leftOptions.label : ''}
                </Cell>
              )}
              {middleOptions !== undefined && (
                <Cell color={middleOptions.color}>
                  <div>{row[middleOptions.header]}</div>
                  {middleOptions.label || ''}
                </Cell>
              )}
              {rightOptions !== undefined && (
                <Cell color={rightOptions.color}>
                  <div>{row[rightOptions.header]}</div>
                  {rightOptions.label || ''}
                </Cell>
              )}
            </Row>
          );
        })}
      </GridContainer>
    );
  }
}

MultiValueRowWrapper.propTypes = {
  viewContent: PropTypes.object.isRequired,
};

const GridContainer = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-column-gap: 10px;
  grid-row-gap: 20px;
`;

const Header = styled.div`
  color: ${props => props.color};
  text-decoration: underline;
  text-align: center;
`;

const Title = styled.div`
  color: ${darkWhite};
  font-weight: 400;
  text-decoration: underline;
  text-align: center;
  grid-column: 1 / 5;
`;

const Cell = styled.div`
  color: ${props => props.color};
  text-align: center;
`;

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  grid-column: 1 / 5;
  grid-column-gap: 20px;
`;

const NameColumn = styled.div`
  color: ${props => props.color};
  text-decoration: underline;
`;

const NameCell = styled.div`
  color: ${props => props.color};
`;
