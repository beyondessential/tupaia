import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { generateQrCodeCanvas } from './utils';

const StyledCanvas = styled.canvas`
  //  Display Flex doesn't work well with exports on canvas so use display block to center the canvas
  display: block;
  margin-inline: auto;
  outline: max(0.0625rem, 1px) solid #dedede;
  width: 80%;
`;

interface QrCodeImageProps extends React.ComponentPropsWithoutRef<typeof StyledCanvas> {
  qrCodeContents?: string;
  humanReadableId?: string;
}

export const QrCodeImage = ({ className, qrCodeContents, humanReadableId }: QrCodeImageProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (ref.current) generateQrCodeCanvas(humanReadableId, qrCodeContents, ref.current);
  }, [humanReadableId, qrCodeContents]);

  return (
    <StyledCanvas
      aria-label={`QR code for ${humanReadableId || qrCodeContents}`}
      className={className}
      ref={ref}
    />
  );
};
