/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import Share from 'react-native-share';

export const shareQrCode = (qrCodeRef, filename) => {
  qrCodeRef.toDataURL(dataURL => {
    const shareOptions = {
      filename,
      type: 'image/*',
      url: `data:image/png;base64,${dataURL}`,
    };
    Share.open(shareOptions);
  });
};
