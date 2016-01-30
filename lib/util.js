var _ = require('../lodash');

var ANSI_RESET = '\u001b[0m',
    USE_COLORS = typeof document == 'undefined';

var objectProto = Object.prototype;

/*----------------------------------------------------------------------------*/

/**
 * A specialized version of `_.cloneDeep` which only clones arrays and plain
 * objects assigning all other values by reference.
 *
 * @memberOf util
 * @param {*} value The value to clone.
 * @returns {*} The cloned value.
 */
var cloneDeep = _.partial(_.cloneDeepWith, _, function(value) {
  if (isPrototype(value) || !(_.isArray(value) || _.isPlainObject(value))) {
    return value;
  }
});

/**
 * Creates a string representation of `value`.
 *
 * @memberOf util
 * @param {*} value The value to inspect.
 * @returns {string} The string representation.
 */
var inspect = _.partial(require('util').inspect, _, {
  'colors': USE_COLORS
});

/**
 * Checks if `value` is comparable.
 *
 * **Note**: Functions, DOM nodes, and objects created by constructors other
 * than `Object` are not comparable.
 *
 * @memberOf util
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a comparable, else `false`.
 */
function isComparable(value) {
  return (
    value == null     || !_.isObject(value) || _.isArguments(value)   ||
    _.isArray(value)  || _.isBoolean(value) || _.isDate(value)        ||
    _.isError(value)  || _.isNumber(value)  || _.isPlainObject(value) ||
    _.isRegExp(value) || _.isString(value)  || _.isTypedArray(value)
  );
}

/**
 * A specialized version of `_.isEqual` which returns `true` for uncomparable values.
 *
 * @memberOf util
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
var isEqual = _.partial(_.isEqualWith, _, _, function(value, other) {
  if (!isComparable(value) && !isComparable(other)) {
    return true;
  }
});

/**
 * Checks if `value` is likely a prototype object.
 *
 * @memberOf util
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Truncates `string` while ensuring ansi colors are reset.
 *
 * @memberOf util
 * @param {string} string The string to truncate.
 * @returns {string} Returns the truncated string.
 */
function truncate(string) {
  var result = _.truncate(string, { 'length': 80 });
  if (USE_COLORS && result.length != string.length) {
    result += ANSI_RESET;
  }
  return result;
}

/*----------------------------------------------------------------------------*/

module.exports = {
  'cloneDeep': cloneDeep,
  'inspect': inspect,
  'isComparable': isComparable,
  'isEqual': isEqual,
  'isPrototype': isPrototype,
  'truncate': truncate
};
