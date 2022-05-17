import React, { useEffect } from 'react';
import { usePDF } from '@react-pdf/renderer';
import { Button } from '@material-ui/core';

// @react-pdf/renderer ships with it's own version of PDFViewer. However it is a bit flaky because
// it doesn't include updateInstance in the useEffect dependencies. Also it is convenient to set
// width, height and toolbar settings in one place
export const PDFDownloadButton = ({ id, children, props }) => {
  const [instance, updateInstance] = usePDF({ document: children });

  useEffect(() => {
    updateInstance();
  }, [updateInstance, children]);

  return (
    <Button href={instance.url} download="test.pdf">
      Download
    </Button>
  );
};
