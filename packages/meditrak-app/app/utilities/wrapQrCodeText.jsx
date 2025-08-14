const MAX_CHARACTERS_PER_LINE = 13;
const MAX_LINES = 3;

const splitWord = word => {
  const split = [];

  let remainder = word;
  while (remainder.length > MAX_CHARACTERS_PER_LINE) {
    const first = remainder.substring(0, MAX_CHARACTERS_PER_LINE);
    remainder = remainder.substring(MAX_CHARACTERS_PER_LINE);
    split.push(first);
  }
  split.push(remainder);

  return split;
};

/*
 * Keep in sync with ui-components/src/components/QrCode/utils/wrapText.ts
 * Merge in RN-968
 */

export const wrapText = text => {
  const words = text.split(' ');

  let lines = [];
  let currentLine = '';
  for (const word of words) {
    if (`${currentLine} ${word}`.length <= MAX_CHARACTERS_PER_LINE) {
      // fits
      currentLine += ` ${word}`;
    } else {
      // doesn't fit, put it on a new line
      if (word.length <= MAX_CHARACTERS_PER_LINE) {
        // can fit on a new line
        if (currentLine !== '') {
          lines = [...lines, currentLine];
        }
        currentLine = word;
      } else {
        // will need multiple new lines
        if (currentLine !== '') {
          lines = [...lines, currentLine];
        }
        const hardSplitWord = splitWord(word);
        const hardSplitAllButLast = hardSplitWord.slice(0, hardSplitWord.length - 1);
        const [hardSplitLast] = hardSplitWord.slice(hardSplitWord.length - 1, hardSplitWord.length);
        lines = [...lines, ...hardSplitAllButLast];
        currentLine = hardSplitLast;
      }
    }
  }
  lines = [...lines, currentLine];

  return lines.map(line => line.trim()).slice(0, MAX_LINES);
};
