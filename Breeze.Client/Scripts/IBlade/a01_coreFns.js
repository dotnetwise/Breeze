﻿/**
 @module core
 **/

var __hasOwnProperty = Object.prototype.hasOwnProperty;

// iterate over object
function __objectForEach(obj, kvFn) {
    for (var key in obj) {
        if (__hasOwnProperty.call(obj, key)) {
            kvFn(key, obj[key]);
        }
    }
}
    
    
function __objectFirst(obj, kvPredicate) {
    for (var key in obj) {
        if (__hasOwnProperty.call(obj, key)) {
            var value = obj[key];
            if (kvPredicate(key, value)) {
                return { key: key, value: value };
            }
        }
    }
    return null;
};

function __objectMapToArray(obj, kvFn) {
    var results = [];
    for (var key in obj) {
        if (__hasOwnProperty.call(obj, key)) {
            var result = kvFn(key, obj[key]);
            if (result) {
                results.push(result);
            }
        }
    }
    return results;
}
    
// Not yet needed 

//// transform an object's values
//function objectMapValue(obj, kvProjection) {
//    var value, newMap = {};
//    for (var key in obj) {
//        if (__hasOwnProperty.call(obj, key)) {
//            value = kvProjection(key, obj[key]);
//            if (value !== undefined) {
//                newMap[key] = value;
//            }
//        }
//    }
//    return newMap;
//}


//// shrink an object's surface
//function objectFilter(obj, kvPredicate) {
//    var result = {};
//    for (var key in obj) {
//        if (__hasOwnProperty.call(obj, key)) {
//            var value = obj[key];
//            if (kvPredicate(key, value)) {
//                result[key] = value;
//            }
//        }
//    }
//    return result;
//};
    
   

// Functional extensions 

// can be used like: persons.filter(propEq("firstName", "John"))
function __propEq(propertyName, value) {
    return function (obj) {
        return obj[propertyName] === value;
    };
}

// can be used like persons.map(pluck("firstName"))
function __pluck(propertyName) {
    return function (obj) { return obj[propertyName]; };
}

// end functional extensions


function __getOwnPropertyValues(source) {
    var result = [];
    for (var name in source) {
        if (__hasOwnProperty.call(source, name)) {
            result.push(source[name]);
        }
    }
    return result;
}

function __extend(target, source) {
    if (!source) return target;
    for (var name in source) {
        if (__hasOwnProperty.call(source, name)) {
            target[name] = source[name];
        }
    }
    return target;
}

function __toJson(source, addlPropNames) {
    var target = {};
    for (var name in source) {
        if (__hasOwnProperty.call(source, name) && name.substr(0, 1) != "_") {
            var value = source[name];
            if (__isFunction(value)) continue;
            if (typeof(value) === "object") {
                if (value && value.parentEnum) {
                    target[name] = value.name;
                }
            } else {
                target[name] = value;
            }
        }
    }
    addlPropNames && addlPropNames.forEach(function(n) {
        target[n] = source[n];
    });
    return target;
}

// array functions

function __arrayFirst(array, predicate) {
    for (var i = 0, j = array.length; i < j; i++) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
    return null;
}

function __arrayIndexOf(array, predicate) {
    for (var i = 0, j = array.length; i < j; i++) {
        if (predicate(array[i])) return i;
    }
    return -1;
}

function __arrayRemoveItem(array, predicateOrItem) {
    var predicate = __isFunction(predicateOrItem) ? predicateOrItem : undefined;
    var l = array.length;
    for (var index = 0; index < l; index++) {
        if (predicate ? predicate(array[index]) : (array[index] === predicateOrItem)) {
            array.splice(index, 1);
            return index;
        }
    }
    return -1;
}

function __arrayZip(a1, a2, callback) {

    var result = [];
    var n = Math.min(a1.length, a2.length);
    for (var i = 0; i < n; ++i) {
        result.push(callback(a1[i], a2[i]));
    }

    return result;
}

function __arrayDistinct(array) {
    array = array || [];
    var result = [];
    for (var i = 0, j = array.length; i < j; i++) {
        if (result.indexOf(array[i]) < 0)
            result.push(array[i]);
    }
    return result;
}

// Not yet needed
//// much faster but only works on array items with a toString method that
//// returns distinct string for distinct objects.  So this is safe for arrays with primitive
//// types but not for arrays with object types, unless toString() has been implemented.
//function arrayDistinctUnsafe(array) {
//    var o = {}, i, l = array.length, r = [];
//    for (i = 0; i < l; i += 1) {
//        var v = array[i];
//        o[v] = v;
//    }
//    for (i in o) r.push(o[i]);
//    return r;
//}

function __arrayEquals(a1, a2, equalsFn) {
    //Check if the arrays are undefined/null
    if (!a1 || !a2) return false;

    if (a1.length != a2.length) return false;

    //go thru all the vars
    for (var i = 0; i < a1.length; i++) {
        //if the var is an array, we need to make a recursive check
        //otherwise we'll just compare the values
        if (Array.isArray( a1[i])) {
            if (!__arrayEquals(a1[i], a2[i])) return false;
        } else {
            if (equalsFn) {
                if (!equalsFn(a1[i], a2[i])) return false;
            } else {
                if (a1[i] != a2[i]) return false;
            }
        }
    }
    return true;
}

// end of array functions
    
function __requireLib(libNames, errMessage) {
    var arrNames = libNames.split(";");
    for (var i = 0, j = arrNames.length; i < j; i++) {
        var lib = __requireLibCore(arrNames[i]);
        if (lib) return lib;
    }
    throw new Error("Unable to initialize " + libNames + ".  " + errMessage || "");
}
    
function __requireLibCore(libName) {
    var lib = window[libName];
    if (lib) return lib;
    if (window.require) {
        lib = window.require(libName);
    }
    if (lib) return lib;
    return null;
}

function __using(obj, property, tempValue, fn) {
    var originalValue = obj[property];
    if (tempValue === originalValue) {
        return fn();
    }
    obj[property] = tempValue;
    try {
        return fn();
    } finally {
        obj[property] = originalValue;
    }
}
    
function __wrapExecution(startFn, endFn, fn) {
    var state;
    try {
        state = startFn();
        return fn();
    } catch (e) {
        if (typeof(state) === 'object') {
            state.error = e;
        }
        throw e;
    } finally {
        endFn(state);
    }
}

function __memoize(fn) {
    return function () {
        var args = Array.prototype.slice.call(arguments),
            hash = "",
            i = args.length,
            currentArg = null;
        while (i--) {
            currentArg = args[i];
            hash += (currentArg === Object(currentArg)) ? JSON.stringify(currentArg) : currentArg;
            fn.memoize || (fn.memoize = {});
        }
        return (hash in fn.memoize) ?
            fn.memoize[hash] :
            fn.memoize[hash] = fn.apply(this, args);
    };
}

function __getUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
    
function __durationToSeconds(duration) {
    // basic algorithm from https://github.com/nezasa/iso8601-js-period
    if (typeof duration !== "string") throw new Error("Invalid ISO8601 duration '" + duration + "'");

    // regex splits as follows - grp0, grp1, y, m, d, grp2, h, m, s
    //                           0     1     2  3  4  5     6  7  8   
    var struct = /^P((\d+Y)?(\d+M)?(\d+D)?)?(T(\d+H)?(\d+M)?(\d+S)?)?$/.exec(duration);
    if (!struct) throw new Error("Invalid ISO8601 duration '" + duration + "'");
        
    var ymdhmsIndexes = [2, 3, 4, 6, 7, 8]; // -> grp1,y,m,d,grp2,h,m,s 
    var factors = [31104000, // year (360*24*60*60) 
        2592000,             // month (30*24*60*60) 
        86400,               // day (24*60*60) 
        3600,                // hour (60*60) 
        60,                  // minute (60) 
        1];                  // second (1)

    var seconds = 0;
    for (var i = 0; i < 6; i++) {
        var digit = struct[ymdhmsIndexes[i]];
        // remove letters, replace by 0 if not defined
        digit = digit ? +digit.replace(/[A-Za-z]+/g, '') : 0;
        seconds += digit * factors[i];
    };
    return seconds;

};
    
// is functions 

function __classof(o) {
    if (o === null) {
        return "null";
    }
    if (o === undefined) {
        return "undefined";
    }
    return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
}

function __isDate(o) {
    return __classof(o) === "date" && !isNaN(o.getTime());
}

function __isFunction(o) {
    return __classof(o) === "function";
}

function __isGuid(value) {
    return (typeof value === "string") && /[a-fA-F\d]{8}-(?:[a-fA-F\d]{4}-){3}[a-fA-F\d]{12}/.test(value);
}
    
function __isDuration(value) {
    return (typeof value === "string") && /^(-|)?P([0-9]+Y|)?([0-9]+M|)?([0-9]+D|)?T?([0-9]+H|)?([0-9]+M|)?([0-9]+S|)?/.test(value);
}

function __isEmpty(obj) {
    if (obj === null || obj === undefined) {
        return true;
    }
    for (var key in obj) {
        if (__hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

function __isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// end of is Functions

// string functions

function __stringStartsWith(str, prefix) {
    // returns false for empty strings too
    if ((!str) || !prefix) return false;
    return str.indexOf(prefix, 0) === 0;
}

function __stringEndsWith(str, suffix) {
    // returns false for empty strings too
    if ((!str) || !suffix) return false;
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// Based on fragment from Dean Edwards' Base 2 library
// format("a %1 and a %2", "cat", "dog") -> "a cat and a dog"
function __formatString(string) {
    var args = arguments;
    var pattern = RegExp("%([1-" + (arguments.length - 1) + "])", "g");
    return string.replace(pattern, function (match, index) {
        return args[index];
    });
};

// end of string functions

// shims

if (!Object.create) {
    Object.create = function (parent) {
        var F = function () { };
        F.prototype = parent;
        return new F();
    };
}

var core = {};

core.getOwnPropertyValues = __getOwnPropertyValues;
core.objectForEach= __objectForEach;
core.objectMapToArray= __objectMapToArray;
core.objectFirst= __objectFirst;

core.extend = __extend;
core.propEq = __propEq;
core.pluck  = __pluck;

core.arrayEquals = __arrayEquals;
// core.arrayDistint = __arrayDistinct;
core.arrayFirst = __arrayFirst;
core.arrayIndexOf = __arrayIndexOf;
core.arrayRemoveItem = __arrayRemoveItem;
core.arrayZip = __arrayZip;

core.requireLib = __requireLib;
core.using = __using;
core.wrapExecution = __wrapExecution;
core.memoize = __memoize;
core.getUuid = __getUuid;
core.durationToSeconds = __durationToSeconds;


core.isDate = __isDate;
core.isGuid = __isGuid;
core.isDuration = __isDuration;
core.isFunction= __isFunction;
core.isEmpty= __isEmpty;
core.isNumeric= __isNumeric;

core.stringStartsWith= __stringStartsWith;
core.stringEndsWith= __stringEndsWith;
core.formatString = __formatString;

core.parent = breeze;
breeze.core = core;


