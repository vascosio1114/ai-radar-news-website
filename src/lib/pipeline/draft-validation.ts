export function containsHan(text: string) {
  return /[\u3400-\u9fff]/.test(text);
}

export function hanRatio(text: string) {
  const compact = text.replace(/\s/g, "");
  if (compact.length === 0) return 0;
  const hanCount = Array.from(compact).filter((char) => /[\u3400-\u9fff]/.test(char)).length;
  return hanCount / compact.length;
}
