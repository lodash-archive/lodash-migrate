var _ = require('./lodash'),
    old = require('lodash');

var listing = require('./lib/listing'),
    mapping = require('./lib/mapping'),
    util = require('./lib/util');

var cache = new _.memoize.Cache,
    reHasReturn = /\breturn\b/;

var messageTemplate = _.template([
  'lodash-migrate: _.<%= name %>(<%= args %>)',
  '  v<%= oldData.version %> => <%= oldData.result %>',
  '  v<%= newData.version %> => <%= newData.result %>',
  ''
].join('\n'));

/*----------------------------------------------------------------------------*/

/**
 * Wraps `oldDash` methods to compare results of `oldDash` and `newDash`.
 *
 * @private
 * @param {Function} oldDash The old lodash function.
 * @param {Function} newDash The new lodash function.
 * @returns {Function} Returns `oldDash`.
 */
function wrapLodash(oldDash, newDash) {
  // Wrap static methods.
  _.each(_.difference(_.functionsIn(oldDash), listing.ignored), function(name) {
    oldDash[name] = wrapMethod(oldDash, newDash, name);
  });

  // Wrap `_.runInContext.
  oldDash.runInContext = _.wrap(oldDash.runInContext, function(runInContext, context) {
    return wrapLodash(runInContext(context), newDash);
  });

  // Wrap `_.prototype` methods that return unwrapped values.
  oldDash.mixin(_.transform(listing.unwrapped, function(source, name) {
    source[name] = oldDash[name];
  }, {}), false);

  // Wrap `_#sample` which can return wrapped and unwrapped values.
  oldDash.prototype.sample = _.wrap(oldDash.sample, function(sample, n) {
    var chainAll = this.__chain__,
        result = sample(this.__wrapped__, n);

    if (chainAll || n != null) {
      result = oldDash(result);
      result.__chain__ = chainAll;
    }
    return result;
  });

  return oldDash;
}

/**
 * Creates a function that compares results of method `name` on `oldDash`
 * and `newDash` and logs a warning for unequal results.
 *
 * @private
 * @param {Function} oldDash The old lodash function.
 * @param {Function} newDash The new lodash function.
 * @param {string} name The name of the lodash method to wrap.
 * @returns {Function} Returns the new wrapped method.
 */
function wrapMethod(oldDash, newDash, name) {
  var newFunc = newDash[mapping.rename[name] || name];
  return _.wrap(oldDash[name], _.rest(function(oldFunc, args) {
    var that = this,
        argsClone = util.cloneDeep(args);

    if (mapping.iteration[name] &&
        (name != 'times' || !reHasReturn.test(argsClone[1]))) {
      argsClone[1] = _.identity;
    }
    var oldResult = oldFunc.apply(that, args),
        newResult = _.attempt(function() { return newFunc.apply(that, argsClone); });

    if (util.isComparable(oldResult)
          ? util.isEqual(oldResult, newResult)
          : !util.isComparable(newResult)
        ) {
      return oldResult;
    }
    // Extract inspected arguments.
    args = util.inspect(args).match(/^\[\s*([\s\S]*?)\s*\]$/)[1];
    // Remove newlines.
    args = args.replace(/\n */g, ' ');

    var message = messageTemplate({
      'name': name,
      'args': util.truncate(args),
      'oldData': {
        'result': util.truncate(util.inspect(oldResult)),
        'version': oldDash.VERSION
      },
      'newData': {
        'result': util.truncate(util.inspect(newResult)),
        'version': newDash.VERSION
      }
    });

    // Only log a specific message once.
    if (!cache.has(message)) {
      cache.set(message, true);
      console.log(message);
    }
    return oldResult;
  }));
}

/*----------------------------------------------------------------------------*/

module.exports = wrapLodash(old, _);
