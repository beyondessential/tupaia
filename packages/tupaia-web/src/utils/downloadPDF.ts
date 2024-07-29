import downloadJs from 'downloadjs';

export const downloadPDF = (data: Blob, exportFileName: string) => {
  downloadJs(data, `${exportFileName}.pdf`);
};
