export function trimSymbols(string, size) {
  if (size === undefined) return string;
  let sum = '';
  let i = 0;
  while (i < string.length) {
      let count = 1;
      const symbol = string[i];
      for (let j = i + 1; j <= string.length; j++) {
        const delta = j-i;
        if (string.substring(i, j) === symbol.repeat(delta)) count=delta;
      }
      i = i + count;
      if (count >= size) sum += symbol.repeat(size); else sum +=symbol;
  }
  return sum;
}
