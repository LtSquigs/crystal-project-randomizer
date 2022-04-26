// taken and modified from https://github.com/davidmehani/deep-search-JSON/blob/master/deep-search-JSON.js
// deep object key search to find a key anywhere in an object and run a function on its parent (with support for async functions)
async function recursiveFind(obj, key, func) {
    if (!obj) return undefined;
    if (typeof obj === "undefined") return undefined;
  
    if (typeof obj !== "object") return undefined;
  
    if (typeof obj[key] !== "undefined" && !obj.seen) {
      if (func) await func(obj)
      obj["seen"] = true
    }
  
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        if (typeof obj[i] === "object") {
          await recursiveFind(obj[i], key, func);
        }
      }
    }
  
    if (!Array.isArray(obj)) {
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) {
        if (typeof obj[keys[i]] === "object") {
          await recursiveFind(obj[keys[i]], key, func);
        }
      }
    }
  
    return obj;
  }
  
  // clean up "seen" flag
  function recursiveFindCleanup(obj) {
    if (!obj) return undefined;
    if (typeof obj === "undefined") return undefined;
  
    if (typeof obj !== "object") return undefined;
  
    if (typeof obj.seen !== "undefined") {
      return delete obj.seen
    }
  
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        if (typeof obj[i] === "object") {
           recursiveFindCleanup(obj[i]);
        }
      }
    }
  
    if (!Array.isArray(obj)) {
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) {
        if (typeof obj[keys[i]] === "object") {
          recursiveFindCleanup(obj[keys[i]]);
        }
      }
    }
  
    return obj;
  }
  
  async function deepSearchJSON(obj, key, func) {
    obj = JSON.parse(JSON.stringify(obj));
    return recursiveFindCleanup(await recursiveFind(obj, key, func))
  }
  
  module.exports = deepSearchJSON;
  