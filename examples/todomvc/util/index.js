module.exports = {
  objectToArray: objectToArray
};

function objectToArray(obj) {
  return Object.keys(obj).map(function toItem(k) {
    return obj[k];
  });
}
