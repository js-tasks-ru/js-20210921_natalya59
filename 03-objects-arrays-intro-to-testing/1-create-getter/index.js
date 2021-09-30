export function createGetter(path) {
  const keys = path.split('.');
  return function(obj) {
    let index = 0;
    let tmp = {...obj};
    while (typeof tmp[keys[index]] === 'object') {
      tmp = tmp[keys[index]];
      index ++;
    }
    return tmp[keys[index]];
  }
}
