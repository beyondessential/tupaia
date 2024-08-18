const EMAIL_TIMEOUT = 30 * 1000; // 30 seconds

export const EMAIL_TIMEOUT_SETTINGS = {
  respondWithEmailTimeout: EMAIL_TIMEOUT,
  platform: 'tupaia',
};

export const handleExportResponse = async (response: {
  headers: Headers;
  buffer: () => Promise<string>;
}) => {
  // Extract the filename from the content-disposition header
  const contentDispositionHeader = response.headers.get('content-disposition') ?? '';
  const regex = /filename="(?<filename>.*)"/; // Find the value between quotes after filename=
  const filePath: string | undefined = regex.exec(contentDispositionHeader)?.groups?.filename;

  return {
    contents: await response.buffer(),
    filePath,
    type: '.xlsx',
  };
};
