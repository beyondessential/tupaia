import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextButton } from '@tupaia/ui-components';

const StyledTabs = styled.div`
  border-bottom: 1px solid #eee;
`;

const Tab = styled(TextButton)`
  display: inline-block;
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  outline: none;
  background-color: transparent;
  border: none;
  color: ${props => props.active};
`;

export const Tabs = ({ tabs, onSelectTab, activeValue }) => (
  <StyledTabs>
    {tabs.map(({ label, value }) => (
      <Tab
        onClick={() => onSelectTab(value)}
        key={value}
        active={activeValue === value ? '#3884b8' : '#666'}
        type="button"
      >
        {label}
      </Tab>
    ))}
  </StyledTabs>
);

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ).isRequired,
  activeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSelectTab: PropTypes.func.isRequired,
};
