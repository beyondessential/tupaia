/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, MutableRefObject } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Button } from '../Button';
import download = require("downloadjs")
import { QrCodeImage } from './QrCodeImage';
import { createQrCodeCanvas, getCanvasUrlForDownload } from './createQrCodeCanvas';

const Container = styled.div`
  text-align: center;
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
`;

interface QrCodeProps {
  qrCodeContents: string;
  humanReadableId: string;
}

export const QrCodeContainer = ({ qrCodeContents, humanReadableId }: QrCodeProps) => {

  const initialValue = document.createElement('canvas')
  // const downloadRef = useRef<HTMLCanvasElement>(initialValue)


  const handleDownload = async () => {
    // if(!downloadRef) {
    //   return
    // }
    // await createQrCodeCanvas(downloadRef, humanReadableId, qrCodeContents)
    // const canvas = downloadRef.current

    // if(!canvas) {
    //   return
    // }
    
    const dataUri = await getCanvasUrlForDownload(humanReadableId, qrCodeContents)
    console.log('data uri for canvas', dataUri)
    if(!dataUri) {
      return
    }
    download(dataUri, `${humanReadableId}.jpeg`, 'image/jpeg');
  };

  return (
    <Container>
      <QrCodeImage qrCodeContents={qrCodeContents} humanReadableId={humanReadableId} />
      <ButtonContainer>
        <Button type="button" onClick={handleDownload}>
          Download
        </Button>
      </ButtonContainer>
    </Container>
  );
};

QrCodeContainer.propTypes = {
  qrCodeContents: PropTypes.string.isRequired,
  humanReadableId: PropTypes.string.isRequired,
};
