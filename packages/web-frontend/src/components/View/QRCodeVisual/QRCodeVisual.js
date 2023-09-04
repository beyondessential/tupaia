/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { QrCodeVisual as NoData } from '@tupaia/ui-components';
import { VIEW_STYLES } from '../../../styles';
import { MultiQRCodeVisual } from './MultiQRCodeVisual';
import { SingleQRCodeVisual } from './SingleQRCodeVisual';
import { EnlargedQRCodeVisual } from './EnlargedQRCodeVisual';

const Wrapper = styled.div`
  position: relative;
`;

const Title = styled(Typography).attrs({
  variant: 'h3',
})`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  text-align: center;
  font-size: 1rem;
`;

const QRCodeVisualComponent = ({
  onClose: originalOnClose,
  isUserLoggedIn,
  viewContent,
  isEnlarged,
}) => {
  if (!isUserLoggedIn) {
    return <div style={VIEW_STYLES.downloadLink}>Please log in to enable file downloads</div>;
  }
  const onClose = () => {
    originalOnClose();
  };
  const { data, ...config } = viewContent;
  if (isEnlarged) return <EnlargedQRCodeVisual data={data} onCancelDownload={onClose} />;

  if (!data.length) return <NoData viewContent={viewContent} />;

  return (
    <Wrapper>
      <Title>{config.name}</Title>
      {data.length > 1 ? <MultiQRCodeVisual data={data} /> : <SingleQRCodeVisual data={data} />}
    </Wrapper>
  );
};

QRCodeVisualComponent.propTypes = {
  onClose: PropTypes.func,
  isUserLoggedIn: PropTypes.bool,
  viewContent: PropTypes.object.isRequired,
  isEnlarged: PropTypes.bool,
};

QRCodeVisualComponent.defaultProps = {
  onClose: () => {},
  isUserLoggedIn: false,
  isEnlarged: false,
};

const mapStateToProps = state => {
  const { isUserLoggedIn } = state.authentication;

  return {
    isUserLoggedIn,
  };
};

export const QRCodeVisual = connect(mapStateToProps, null)(QRCodeVisualComponent);
