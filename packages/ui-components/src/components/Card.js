/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiCard from '@material-ui/core/Card';
import MuiCardActions from '@material-ui/core/CardActions';
import MuiCardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as COLORS from '../../stories/story-utils/theme/colors'; // todo fix colors

/*
 * Card
 */
export const Card = styled(MuiCard)`
  margin-bottom: 1rem;
  border-color: ${COLORS.GREY_DE};
`;

/*
 * Card Header
 */
const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 12px;
  margin-left: 30px;
  margin-right: 30px;
  border-bottom: 1px solid ${COLORS.GREY_DE};
`;

const HeaderTitle = styled(Typography)`
  font-size: 15px;
  line-height: 18px;
  font-weight: 500;
`;

const HeaderLabel = styled(Typography)`
  font-size: 15px;
  line-height: 18px;
  font-weight: 400;
  color: ${COLORS.TEXT_MIDGREY};
`;

export const CardHeader = ({ title, label, color }) => (
  <StyledDiv>
    <HeaderTitle color={color}>{title}</HeaderTitle>
    <HeaderLabel color={color}>{label}</HeaderLabel>
  </StyledDiv>
);
CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  label: PropTypes.any,
  color: PropTypes.string,
};

CardHeader.defaultProps = {
  color: undefined,
  label: undefined,
};
/*
 * Card Content
 */
export const CardContent = styled(MuiCardContent)`
  padding: 20px 30px;
`;

/*
 * Card Footer
 */
export const CardFooter = styled(props => <div {...props} />)`
  border-top: 1px solid ${COLORS.GREY_DE};
  padding: 20px 30px 25px;
`;

/*
 * Card Actions
 */
export const CardActions = styled(MuiCardActions)`
  // Custom styles
`;
