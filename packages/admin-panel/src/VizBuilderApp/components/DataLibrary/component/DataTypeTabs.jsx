import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledDataTypeTabs = styled.div`
  &.has-multiple {
    display: flex;
    align-items: center;
    min-height: 50px;
    padding: 15px;
    gap: 20px;
  }
  &:not(.has-multiple) {
    padding-top: 20px;
  }
`;

const DataTypeTab = styled.a`
  &:not(.selected) {
    cursor: pointer;
  }
  &.selected {
    color: #418bbd;
  }
`;

export const DataTypeTabs = ({ dataTypes, dataType, onChange }) => (
  <StyledDataTypeTabs className={dataTypes.length > 1 ? 'has-multiple' : ''}>
    {dataTypes.length > 1 &&
      dataTypes.map((d, index) => (
        <DataTypeTab
          key={index} // eslint-disable-line react/no-array-index-key
          onClick={event => onChange(event, d)}
          className={d === dataType ? 'selected' : ''}
        >
          {d}
        </DataTypeTab>
      ))}
  </StyledDataTypeTabs>
);

DataTypeTabs.propTypes = {
  dataTypes: PropTypes.array,
  dataType: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

DataTypeTabs.defaultProps = {
  dataTypes: [],
};
