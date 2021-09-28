export function sortStrings(arr, param = 'asc') {
  const arrSorted = arr.slice();
  const compareParams = [['ru', 'en'], {sensitivity: 'variant', caseFirst: 'upper'}];
  arrSorted.sort((a,b) => param === 'asc'? a.localeCompare(b, ...compareParams): -a.localeCompare(b, ...compareParams));
  return arrSorted;
}
