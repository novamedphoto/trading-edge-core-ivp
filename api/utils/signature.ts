export function verifySecret(provided: string | undefined, expected: string | undefined) {
  if (!provided || !expected) return false;
  if (provided.length !== expected.length) return false;
  let res = 0;
  for (let i = 0; i < provided.length; i++) {
    res |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return res === 0;
}
