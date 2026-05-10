import CryptoJS from 'crypto-js';

/**
 * Aplica SHA-256 a la palabra secreta ingresada.
 * Se normaliza a minúsculas y se le quitan los espacios para evitar 
 * que un espacio accidental cambie el hash.
 */
export const hashSecretWord = (word: string): string => {
  if (!word) return '';
  const normalized = word.trim().toLowerCase();
  return CryptoJS.SHA256(normalized).toString(CryptoJS.enc.Hex);
};

export const verifySecretWord = (wordEntered: string, hashedWordStored: string): boolean => {
  const hashEntered = hashSecretWord(wordEntered);
  return hashEntered === hashedWordStored;
};
