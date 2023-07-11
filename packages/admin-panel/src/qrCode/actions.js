/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { QR_CODE_MODAL_DISMISS, QR_CODE_MODAL_OPEN } from './constants';

export const openQrCodeModal = (qrCodeContents, humanReadableId) => async dispatch => {
  dispatch({
    type: QR_CODE_MODAL_OPEN,
    qrCodeContents,
    humanReadableId,
  });
};

export const closeQrCodeModal = () => ({
  type: QR_CODE_MODAL_DISMISS,
});
