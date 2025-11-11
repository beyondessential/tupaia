export function formatFraction(numerator: number, denominator: number): string {
  // U+202F is narrow no-break space
  return `${numerator.toLocaleString()}\u{202F}/\u{202F}${denominator.toLocaleString()}`;
}

/**
 * Given a number, returns it as a string. If negative, it’s prefixed with the true minus
 * sign (U+2212) instead of the hyphen minus (U+002D) typographic approximation. Given a string,
 * replaces all hyphen minuses with the minus sign.
 */
export function formatNumberWithTrueMinus(value: number | string): string {
  return typeof value === 'number'
    ? value.toString().replace('-', '\u{2212}')
    : value.replaceAll('-', '\u{2212}');
}
