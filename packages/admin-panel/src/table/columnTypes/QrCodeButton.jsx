import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { openQrCodeModal } from '../../qrCode';
import { ColumnActionButton } from './ColumnActionButton';

const Svg = styled.svg`
  fill: ${({ theme }) => theme.palette.text.primary};
  height: 1.3rem;
  width: 1.3rem;
`;

const LittleQrCodeIcon = props => {
  return (
    <Svg
      width={29}
      height={29}
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.3333 29H16.1111V25.7778H19.3333V29ZM16.1111 17.7222H12.8889V25.7778H16.1111V17.7222ZM29 14.5H25.7778V20.9444H29V14.5ZM25.7778 11.2778H22.5556V14.5H25.7778V11.2778ZM6.44444 14.5H3.22222V17.7222H6.44444V14.5ZM3.22222 11.2778H0V14.5H3.22222V11.2778ZM14.5 3.22222H17.7222V0H14.5V3.22222ZM2.41667 2.41667V7.25H7.25V2.41667H2.41667ZM9.66667 9.66667H0V0H9.66667V9.66667ZM2.41667 21.75V26.5833H7.25V21.75H2.41667ZM9.66667 29H0V19.3333H9.66667V29ZM21.75 2.41667V7.25H26.5833V2.41667H21.75ZM29 9.66667H19.3333V0H29V9.66667ZM25.7778 25.7778V20.9444H19.3333V24.1667H22.5556V29H29V25.7778H25.7778ZM22.5556 14.5H16.1111V17.7222H22.5556V14.5ZM16.1111 11.2778H6.44444V14.5H9.66667V17.7222H12.8889V14.5H16.1111V11.2778ZM17.7222 9.66667V6.44444H14.5V3.22222H11.2778V9.66667H17.7222ZM6.04167 3.625H3.625V6.04167H6.04167V3.625ZM6.04167 22.9583H3.625V25.375H6.04167V22.9583ZM25.375 3.625H22.9583V6.04167H25.375V3.625Z" />
    </Svg>
  );
};

export const QrCodeButtonComponent = ({ openModal, actionConfig }) => {
  const { title = 'View QR code' } = actionConfig;
  return (
    <ColumnActionButton className="edit-button" onClick={openModal} title={title}>
      <LittleQrCodeIcon />
    </ColumnActionButton>
  );
};

QrCodeButtonComponent.propTypes = {
  openModal: PropTypes.func.isRequired,
  actionConfig: PropTypes.object.isRequired,
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  openModal: () => {
    const { row, actionConfig } = ownProps;
    const { qrCodeContentsKey, humanReadableIdKey, qrCodePrefix } = actionConfig;
    if (!qrCodeContentsKey || !humanReadableIdKey) {
      throw new Error(
        'QR code button misconfigured. Must specify qrCodeContentsKey and humanReadableIdKey',
      );
    }
    const qrCodeContents = row.original[qrCodeContentsKey];
    const humanReadableId = row.original[humanReadableIdKey];
    dispatch(openQrCodeModal(`${qrCodePrefix}${qrCodeContents}`, humanReadableId));
  },
});

export const QrCodeButton = connect(null, mapDispatchToProps)(QrCodeButtonComponent);
