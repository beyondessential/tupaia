import React from 'react';
import PropTypes from 'prop-types';
import downloadJs from 'downloadjs';
import { Document, Page, Image, pdf } from '@react-pdf/renderer';

const CostomPDFDocument = ({ pageScreenshots }) => {
  return (
    <Document>
      {pageScreenshots.map(pageScreenshot => (
        <Page key={Math.random(100)} size="A4">
          <Image src={pageScreenshot} />
        </Page>
      ))}
    </Document>
  );
};

CostomPDFDocument.propTypes = {
  pageScreenshots: PropTypes.array.isRequired,
};

export const exportImagesToPDF = async (pageScreenshots, title) => {
  const doc = <CostomPDFDocument pageScreenshots={pageScreenshots} />;
  const asPdf = pdf([]); // {} is important, throws without an argument
  asPdf.updateContainer([doc]);
  const blob = await asPdf.toBlob();
  downloadJs(blob, `${title}.pdf`);
};
