export const objectIdToTimestamp = (objectId: string): number => {
  // Extract the timestamp portion (first 4 bytes)
  const timestampHex = objectId.substring(0, 8);
  return Number.parseInt(timestampHex, 16);
}
