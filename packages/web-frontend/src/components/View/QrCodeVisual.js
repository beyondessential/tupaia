/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { QrCodeVisual as BaseQrCodeVisual, OFF_WHITE, NoData } from '@tupaia/ui-components';
import { VIEW_STYLES } from '../../styles';

const StyledQrCodeContainer = styled(BaseQrCodeVisual)`
  .qrcode {
    color: ${OFF_WHITE};
  }
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

const QrCodeVisualComponent = ({
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

  return (
    <>
      {!isEnlarged && <Title>{config.name}</Title>}
      {data.length === 0 ? (
        <NoData viewContent={viewContent} />
      ) : (
        <StyledQrCodeContainer data={data} onCloseModal={onClose} isEnlarged={isEnlarged} />
      )}
    </>
  );
};

QrCodeVisualComponent.propTypes = {
  onClose: PropTypes.func,
  isUserLoggedIn: PropTypes.bool,
  viewContent: PropTypes.object.isRequired,
  isEnlarged: PropTypes.bool,
};

QrCodeVisualComponent.defaultProps = {
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

export const QrCodeVisual = connect(mapStateToProps, null)(QrCodeVisualComponent);
