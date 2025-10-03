// generateId :: Integer -> String

export const useGenerateId = (len: number) => {
  const dec2hex = (dec: any) => {
    return dec.toString(16).padStart(2, '0');
  };

  var arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  const randomId = Array.from(arr, dec2hex).join('');
  return { randomId };
};
