import { getTempDirectory } from './getTempDirectory';

export const getExportPathForUser = (userId: string) => getTempDirectory(`exports/${userId}`);
