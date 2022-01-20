/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Collapse, List, ListItem, ListSubheader } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { ExpandLess, ExpandMore, OpenInNew } from '@material-ui/icons';
import styled from 'styled-components';

const TYPE_HEADINGS = {
  question: 'Questions',
  indicator: 'Indicators',
  dashboardItem: 'Dashboard Items',
  mapOverlay: 'Map Overlays',
  legacyReport: 'Legacy Reports',
  dataGroup: 'Data Groups',
  survey: 'Surveys',
};

const StyledHeader = styled(Typography)`
  display: flex;
  cursor: pointer;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const NumResults = styled.span`
  font-size: 12px;
  color: ${props => props.theme.palette.text.secondary};
  margin-left: 0.5em;
`;

const StyledLink = styled(Link)`
  display: flex;
  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .MuiSvgIcon-root {
    width: 16px;
    color: ${props => props.theme.palette.text.tertiary};
    margin-left: 15px;
  }
`;

export const UsedBy = ({ usedBy, isLoading, errorMessage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const types = [...new Set(usedBy.map(item => item.type))];

  return (
    <>
      <StyledHeader variant="h6" gutterBottom onClick={() => setIsOpen(!isOpen)}>
        <HeaderText>
          Used by
          <NumResults>{!isLoading && !errorMessage && <>({usedBy.length})</>}</NumResults>
        </HeaderText>
        {!isOpen && <ExpandMore />}
        {isOpen && <ExpandLess />}
      </StyledHeader>

      <Collapse in={isOpen}>
        {isLoading && <>Loading...</>}
        {!isLoading && errorMessage && <>Failed to load used by: {errorMessage}</>}
        {!isLoading && !errorMessage && (
          <Card>
            <CardContent>
              {types.map(type => (
                <List
                  key={type}
                  subheader={<ListSubheader>{TYPE_HEADINGS[type] ?? type}</ListSubheader>}
                >
                  {usedBy
                    .filter(item => item.type === type)
                    .map(item => (
                      <ListItem
                        key={item.url}
                        button
                        component={StyledLink}
                        to={item.url}
                        target="_blank"
                      >
                        <span>{item.name}</span>
                        <OpenInNew />
                      </ListItem>
                    ))}
                </List>
              ))}
            </CardContent>
          </Card>
        )}
      </Collapse>
    </>
  );
};

UsedBy.defaultProps = {
  isLoading: false,
  errorMessage: null,
};

UsedBy.propTypes = {
  usedBy: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};
