import log from 'winston';

import { generateId } from '@tupaia/database';

/**
 * Photos taken for surveys, kept as files in the origin private file system (OPFS), outside the
 * database.
 *
 * A Photo answer used to hold its photo inline, as a Base64 data URL several megabytes long. Every
 * read of it then went through PGlite’s WebAssembly memory, its worker and the page as text, and
 * a sync left hundreds of megabytes of those copies waiting to be collected, which got the page
 * killed on 2 GB phones. Now the answer holds just the photo’s ID, and sync sends the file itself,
 * ahead of the answers (see `uploadPendingPhotos`). The browser streams a file from disk as it
 * sends it, so the photo never has to be read into the page’s memory. The sync server turns the ID
 * into the photo’s URL, and the device pulls that back down.
 *
 * Photos wait in `pending/` until they’re uploaded, then in `uploaded/` until their answers come
 * back from the server holding the photo’s URL instead of its ID (see
 * {@link removePhotosNoLongerNeeded}), so they can still be shown in the meantime.
 *
 * Files are named `<id>.<subtype>`, as in `5f1b….jpeg`, since OPFS doesn’t keep a file’s type.
 */

const ROOT_DIRECTORY = 'survey-photos';
const PENDING = 'pending';
const UPLOADED = 'uploaded';

/** Image types the server converts to WebP, so whose URL is known from the ID alone */
const FILE_TYPES = new Set(['avif', 'gif', 'jpeg', 'png', 'tiff', 'webp']);

export interface PhotoFileName {
  id: string;
  name: string;
  type: string;
}

const parseName = (name: string): PhotoFileName | null => {
  const [id, subtype, ...rest] = name.split('.');
  if (!id || !subtype || rest.length > 0 || !FILE_TYPES.has(subtype)) return null;
  return { id, name, type: `image/${subtype}` };
};

/** Whether this browser can write files to OPFS from the page */
const canStorePhotoFiles = () =>
  typeof navigator !== 'undefined' &&
  typeof navigator.storage?.getDirectory === 'function' &&
  typeof FileSystemFileHandle !== 'undefined' &&
  'createWritable' in FileSystemFileHandle.prototype;

const getDirectory = async (name: typeof PENDING | typeof UPLOADED) => {
  const root = await navigator.storage.getDirectory();
  const photos = await root.getDirectoryHandle(ROOT_DIRECTORY, { create: true });
  return await photos.getDirectoryHandle(name, { create: true });
};

const getDirectories = async () => [await getDirectory(PENDING), await getDirectory(UPLOADED)];

const readPhoto = async (directory: FileSystemDirectoryHandle, photo: PhotoFileName) => {
  const file = await (await directory.getFileHandle(photo.name)).getFile();
  // Refers to the same data on disk, just with its type set
  return new File([file], photo.name, { type: photo.type, lastModified: file.lastModified });
};

/** TypeScript 5.3’s DOM types don’t include directory iteration yet */
const listPhotos = async (directory: FileSystemDirectoryHandle) => {
  const photos: PhotoFileName[] = [];
  for await (const name of (directory as unknown as { keys(): AsyncIterable<string> }).keys()) {
    const photo = parseName(name);
    if (photo) photos.push(photo);
  }
  return photos;
};

const removeIfPresent = async (directory: FileSystemDirectoryHandle, name: string) => {
  try {
    await directory.removeEntry(name);
  } catch (error) {
    if ((error as DOMException)?.name !== 'NotFoundError') throw error;
  }
};

const dataUrlToBlob = (dataUrl: string) => {
  const match = /^data:image\/([a-z]+);base64,/.exec(dataUrl);
  if (!match || !FILE_TYPES.has(match[1])) return null;

  const binary = atob(dataUrl.slice(match[0].length));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: `image/${match[1]}` }), subtype: match[1] };
};

/**
 * Saves a photo as a file.
 *
 * @param dataUrl The photo, as the photo question gives it
 * @returns The photo’s ID, to store as the answer, or `null` if it can’t be stored as a file (so
 * the answer should hold the data URL, as it used to)
 */
const storePhoto = async (dataUrl: string): Promise<string | null> => {
  if (!canStorePhotoFiles()) return null;
  const decoded = dataUrlToBlob(dataUrl);
  if (!decoded) return null;

  const id: string = generateId();
  const name = `${id}.${decoded.subtype}`;
  const directory = await getDirectory(PENDING);
  try {
    const writable = await (await directory.getFileHandle(name, { create: true })).createWritable();
    await writable.write(decoded.blob);
    await writable.close();
  } catch (error) {
    await removeIfPresent(directory, name).catch(() => {});
    throw error;
  }
  return id;
};

/**
 * Saves the photos among a survey’s answers as files, and puts their IDs in the answers instead.
 * A photo that can’t be saved as a file stays in its answer, as photos used to.
 *
 * @returns The answers to save, and the IDs of the photos saved, so they can be removed if the
 * response isn’t saved after all
 */
export const storePhotoAnswersAsFiles = async <T extends Record<string, unknown>>(
  answers: T,
  photoQuestionIds: string[],
): Promise<{ answers: T; photoIds: string[] }> => {
  const result: Record<string, unknown> = { ...answers };
  const photoIds: string[] = [];

  for (const questionId of photoQuestionIds) {
    const value = answers[questionId];
    if (typeof value !== 'string') continue;
    try {
      const id = await storePhoto(value);
      if (id) {
        result[questionId] = id;
        photoIds.push(id);
      }
    } catch (error) {
      log.warn('storePhotoAnswersAsFiles: keeping photo in its answer instead', { error });
    }
  }

  return { answers: result as T, photoIds };
};

/** Removes photos, wherever they are, e.g. those of a response that failed to save */
export const removePhotos = async (ids: string[]) => {
  if (ids.length === 0 || !canStorePhotoFiles()) return;
  const idSet = new Set(ids);
  for (const directory of await getDirectories()) {
    for (const photo of await listPhotos(directory)) {
      if (idSet.has(photo.id)) await removeIfPresent(directory, photo.name);
    }
  }
};

/** Finds a photo by its ID, whether it’s been uploaded yet or not */
export const findPhoto = async (id: string): Promise<File | null> => {
  if (!canStorePhotoFiles()) return null;
  for (const directory of await getDirectories()) {
    const photo = (await listPhotos(directory)).find(p => p.id === id);
    if (photo) return await readPhoto(directory, photo);
  }
  return null;
};

/** Photos that haven’t been uploaded yet */
export const listPendingPhotos = async (): Promise<PhotoFileName[]> => {
  if (!canStorePhotoFiles()) return [];
  return await listPhotos(await getDirectory(PENDING));
};

export const readPendingPhoto = async (photo: PhotoFileName) =>
  await readPhoto(await getDirectory(PENDING), photo);

/** Moves a photo from `pending/` to `uploaded/`, once the server has it */
export const markPhotoUploaded = async (photo: PhotoFileName) => {
  const pending = await getDirectory(PENDING);
  const uploaded = await getDirectory(UPLOADED);
  const handle = await pending.getFileHandle(photo.name);

  // Chrome can move it without copying. Elsewhere, copy it, and remove the original
  const movable = handle as FileSystemFileHandle & {
    move?: (directory: FileSystemDirectoryHandle) => Promise<void>;
  };
  if (typeof movable.move === 'function') {
    await movable.move(uploaded);
    return;
  }
  const writable = await (
    await uploaded.getFileHandle(photo.name, { create: true })
  ).createWritable();
  await writable.write(await handle.getFile());
  await writable.close();
  await pending.removeEntry(photo.name);
};

/**
 * Removes photos the device no longer needs: those whose answers have come back from the server
 * holding the photo’s URL instead of its ID.
 *
 * @param findIdsStillInAnswers Given photo IDs, returns those that some answer still holds
 * @param savedBefore Only photos saved before this time (ms since the epoch) are considered, so a
 * photo saved for a response still being submitted isn’t taken for one that’s no longer needed
 */
export const removePhotosNoLongerNeeded = async (
  findIdsStillInAnswers: (ids: string[]) => Promise<string[]>,
  savedBefore: number,
) => {
  if (!canStorePhotoFiles()) return;

  const candidates: { directory: FileSystemDirectoryHandle; photo: PhotoFileName }[] = [];
  for (const directory of await getDirectories()) {
    for (const photo of await listPhotos(directory)) {
      const { lastModified } = await (await directory.getFileHandle(photo.name)).getFile();
      if (lastModified < savedBefore) candidates.push({ directory, photo });
    }
  }
  if (candidates.length === 0) return;

  const stillNeeded = new Set(await findIdsStillInAnswers(candidates.map(c => c.photo.id)));
  for (const { directory, photo } of candidates) {
    if (!stillNeeded.has(photo.id)) await removeIfPresent(directory, photo.name);
  }
};
