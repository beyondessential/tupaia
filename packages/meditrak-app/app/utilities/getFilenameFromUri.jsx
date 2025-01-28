export const getFilenameFromUri = uri => (uri ? uri.substring(uri.lastIndexOf('/') + 1) : null);
