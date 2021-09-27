export function sortStrings(arr, param = 'asc') {
  const arrSorted = arr.slice();
  for (let i = 0; i < arrSorted.length - 1 ; i++) {
    for (let j = 0; j < arrSorted.length - 1 ; j++) {
      if (arrSorted[j].localeCompare(arrSorted[j + 1], ['ru', 'en'], {sensitivity: 'variant', caseFirst: 'upper'}) > 0) {
        const temp = arrSorted[j];
        arrSorted[j] = arrSorted[j + 1];
        arrSorted[j + 1] = temp;
      }
    }
  }
  return (param === 'asc')? arrSorted : arrSorted.reverse();
}
