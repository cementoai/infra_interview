let indexCounter = 0;

const getId = function () {
  return `id_${indexCounter++}`;
}

const threadSleep = async function (delay) {
  if (!delay) return;
  return new Promise(resolve => {
    let timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      resolve(true);
    }, delay);
  });
};

const wait = async function (waitWhileCondition, interval = 1000) {
  while (waitWhileCondition())
    await threadSleep(interval);
};

function removeNulls(obj, getRemovedPaths = false, removedPathsOptions = {}) {
  const { maxDepthOfRemovedPathsToReturn = 0, withArrayIndexesPaths = false } = removedPathsOptions;
  return getRemovedPaths ? _removeNullsAndGetPaths(obj, maxDepthOfRemovedPathsToReturn, withArrayIndexesPaths) : _removeNulls(obj);
}

function _removeNullsAndGetPaths(obj, maxDepthOfRemovedPathsToReturn, withArrayIndexesPaths, depth = 0) {
  let paths = [];

  Object.entries(obj).forEach(([k, v]) => {
    if (v === null || v === undefined) {
      let deletedKey = _deleteKey(obj, k)
      if (depth <= maxDepthOfRemovedPathsToReturn) paths.push(deletedKey);
      return;
    }

    if (typeof v === 'object') {
      let innerPaths = _removeNullsAndGetPaths(v, maxDepthOfRemovedPathsToReturn, withArrayIndexesPaths, depth + 1);
      let currentValues = Object.values(v);

      if (!currentValues.length) {
        let deletedKey = _deleteKey(obj, k)
        if (depth <= maxDepthOfRemovedPathsToReturn) paths.push(deletedKey);
        return;
      }

      if (Array.isArray(v)) {
        obj[k] = currentValues;
        innerPaths
          .filter(innerPath => innerPath.includes('.') || withArrayIndexesPaths)
          .forEach(innerPath => paths.push(`${k}.${innerPath}`));
        return;
      } 
    
      innerPaths.forEach(innerPath => paths.push(`${k}.${innerPath}`));
    }
  });

  return paths;
}

function _removeNulls(obj) {
  Object.entries(obj).forEach(([k, v]) => {
    if (v === null || v === undefined) {
      delete obj[k];
    } else if (v && typeof v === 'object') {
      obj[k] = _removeNulls(v);
      if (!Object.keys(obj[k]).length) 
        delete obj[k];
    }
  });
  return Array.isArray(obj) ? Object.values(obj) : obj;
}


module.exports = {
  wait,
  getId,
  removeNulls,
  threadSleep,
};
