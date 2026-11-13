import sanitize from 'sanitize-filename';

export const toFilename = (string, stripSpecialAndLowercase = false) => {
  const maxLength = 255;
  let sanitized = sanitize(string);

  if (stripSpecialAndLowercase) {
    sanitized = sanitized
      .replace(/\s+/g, '-') // replace spaces with dashes
      .replace(/ *\([^)]*\) */g, '') // remove text in brackets
      .replace(/[^a-z0-9-]/gi, '') // remove non numbers and letters
      .replace(/-+/g, '-') // remove consecutive dashes
      .toLowerCase();
  }

  return sanitized.length <= maxLength ? sanitized : sanitized.slice(0, maxLength);
};
