import React from 'react';
import { Document, Page, Text, View, PDFViewer } from '@react-pdf/renderer';
import { PDFDownloadButton } from '../src/components/PDFDownloadButton';

export default {
  title: 'PDF Viewer',
};

const PDF = () => (
  <Document>
    <Page size="A4">
      <View>
        <Text>Covid-19 Test History</Text>
      </View>
    </Page>
  </Document>
);

export const PDFDownload = () => (
  <>
    <PDFViewer width={800} height={500} showToolbar={false}>
      <PDF />
    </PDFViewer>
    <PDFDownloadButton>
      <PDF />
    </PDFDownloadButton>
  </>
);
