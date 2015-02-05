var _ = require('lodash-compat'),
    old = require('lodash');

var cache = Object.create(null),
    inspect = _.partial(require('util').inspect, _, { 'colors': !_.support.dom }),
    trunc = _.partial(_.trunc, _, 80);

var isComparable = function(value) {
  return (
    value == null          || !_.isObject(value)   || _.isArray(value)      ||
    _.isPlainObject(value) || _.isArguments(value) || _.isBoolean(value)    ||
    _.isDate(value)        || _.isError(value)     || _.isNumber(value)     ||
    _.isRegExp(value)      || _.isString(value)    || _.isTypedArray(value)
  );
};

var customizer = function(value, other) {
  return _.some([value, other], isComparable) ? undefined : true;
};

// Wrap static methods.
_.each(_.without(_.functions(old), 'mixin'), function(name) {
  var newFunc = _[name];
  old[name] = _.wrap(old[name], function(oldFunc) {
    var args = _.slice(arguments, 1),
        oldResult = oldFunc.apply(old, args),
        newResult = _.attempt(function() { return newFunc.apply(_, args); });

    if (!isComparable(oldResult)
        ? isComparable(newResult)
        : !_.isEqual(oldResult, newResult, customizer)
        ) {
      args = inspect(args).match(/^\[\s*([\s\S]*?)\s*\]$/)[1];
      args = args.replace(/\n */g, ' ');

      var message = [
        'lodash-migrate: _.' + name + '(' + trunc(args) + ')',
        '  v' + old.VERSION + ' => ' + trunc(inspect(oldResult)),
        '  v' + _.VERSION   + ' => ' + trunc(inspect(newResult)),
        ''
      ].join('\n');

      // only log a specific message once
      if (!cache[message]) {
        cache[message] = true;
        console.log(message);
      }
    }
    return oldResult;
  });
});

// Wrap `_.prototype` methods that return unwrapped values when chaining.
old.mixin(_.transform((
  'all,any,clone,cloneDeep,contains,detect,escape,every,find,findIndex,findKey,' +
  'findLast,findLastIndex,findLastKey,findWhere,foldl,foldr,has,include,identity,' +
  'indexOf,inject,isArguments,isArray,isBoolean,isDate,isElement,isEmpty,isFinite,' +
  'isFunction,isNaN,isNull,isNumber,isObject,isPlainObject,isRegExp,isString,isUndefined,' +
  'lastIndexOf,noConflict,noop,now,parseInt,random,reduce,reduceRight,result,runInContext,' +
  'size,some,sortedIndex,template,unescape,uniqueId').split(','), function(source, name) {
    source[name] = old[name];
}, {}), false);

// Wrap `_.prototype` methods capable of returning wrapped and unwrapped values when chaining.
_.assign(old.prototype, _.transform(
  'first,head,last,sample,take'.split(','), function(source, name) {
    var callbackable = name !== 'sample',
        func = old[name];

    source[name] = function(n, guard) {
      var chainAll = this.__chain__,
          result = func(this.__wrapped__, n, guard);

      if (!chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))) {
        return result;
      }
      result = old(result);
      result.__chain__ = chainAll;
      return result;
    };
}, {}));

module.exports = old;
