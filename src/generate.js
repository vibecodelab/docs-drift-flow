import { randomInt } from 'node:crypto';

const ALPHABETS = {
  base58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  hex: '0123456789abcdef',
  alphanumeric: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
};

// Characters that are easy to misread in a narrow font or over the phone.
const AMBIGUOUS = new Set(['0', 'O', 'o', '1', 'l', 'I', '5', 'S', '8', 'B']);

/** A prefix is prepended after generation, so it never counts toward `length`. */
export function generateKey({ length, alphabet, excludeAmbiguous, prefix }) {
  let pool = ALPHABETS[alphabet];
  if (excludeAmbiguous) pool = [...pool].filter((character) => !AMBIGUOUS.has(character)).join('');

  let key = '';
  for (let i = 0; i < length; i += 1) key += pool[randomInt(pool.length)];
  return prefix + key;
}

export const alphabets = () => Object.keys(ALPHABETS);
