import React from 'react';
import { ViewReport } from '@tupaia/types';
import { MultiQRCodes } from './MultiQRCodes';
import { SingleQRCode } from './SingleQRCode';

interface QRCodeProps {
  report: ViewReport;
}

export const QRCode = ({ report: { data } }: QRCodeProps) => {
  if (!data) return null;
  return (
    <>
      {data.length > 1 ? (
        <MultiQRCodes
          data={
            data as {
              name: string;
              value: string;
            }[]
          }
        />
      ) : (
        <SingleQRCode data={data} />
      )}
    </>
  );
};
