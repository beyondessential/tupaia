import log from 'winston';

import { post } from '../api';
import { listPendingPhotos, markPhotoUploaded, readPendingPhoto } from '../photos';

/**
 * Sends the photos taken on this device to the server, one file at a time, ahead of pushing the
 * answers that refer to them by ID (see `photos/photoFiles`).
 *
 * Each photo goes as the request body on its own, straight from its file. The browser reads a file
 * body from disk as it sends it, so unlike a photo held in an answer, it never becomes a string in
 * the page’s memory, and nothing is left behind for the garbage collector afterwards.
 *
 * The server keeps the first copy of a photo and accepts repeats, so a photo whose response went
 * missing is just sent again next time.
 *
 * Uses no database connection, so it doesn’t hold up the app.
 */
export const uploadPendingPhotos = async (
  progressCallback: (total: number, uploadedCount: number) => void,
) => {
  const photos = await listPendingPhotos();
  if (photos.length === 0) return;

  log.debug(`uploadPendingPhotos: uploading ${photos.length} photos`);
  for (const [index, photo] of photos.entries()) {
    await post(`surveyPhotos/${photo.id}`, {
      data: await readPendingPhoto(photo),
      headers: { 'Content-Type': photo.type },
    });
    await markPhotoUploaded(photo);
    progressCallback(photos.length, index + 1);
  }
};
