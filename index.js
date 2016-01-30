var _ = require('./lodash'),
    old = require('lodash');

var listing = require('./lib/listing'),
    mapping = require('./lib/mapping'),
    util = require('./lib/util');

var cache = new _.memoize.Cache;

var messageTemplate = _.template([
  'lodash-migrate: _.<%= name %>(<%= args %>)',
  '  v<%= oldData.version %> => <%= oldData.result %>',
  '  v<%= newData.version %> => <%= newData.result %>',
  ''
].join('\n'));

/*----------------------------------------------------------------------------*/

/**
 * Creates a function that compares the results of method `name` on `oldDash`
 * and `newDash` and logs a warning for mismatched results.
 *
 * @private
 * @param {Function} oldDash The old lodash function.
 * @param {Function} newDash The new lodash function.
 * @param {string} name The name of the lodash method to wrap.
 * @returns {Function} Returns the new wrapped method.
 */
function wrap(oldDash, newDash, name) {
  var newFunc = newDash[mapping.renameMap[name] || name];
  return _.wrap(oldDash[name], _.rest(function(oldFunc, args) {
    var that = this,
        argsClone = util.cloneDeep(args),
        oldResult = oldFunc.apply(that, args),
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

// Wrap static methods.
_.each(_.difference(_.functionsIn(old), listing.ignored), function(name) {
  old[name] = wrap(old, _, name);
});

// Wrap `_.prototype` methods that return unwrapped values.
old.mixin(_.transform(listing.unwrapped, function(source, name) {
  source[name] = old[name];
}, {}), false);

// Wrap `_#sample` which can return wrapped and unwrapped values.
old.prototype.sample = _.wrap(old.sample, function(sample, n) {
  var chainAll = this.__chain__,
      result = sample(this.__wrapped__, n);

  if (chainAll || n != null) {
    result = old(result);
    result.__chain__ = chainAll;
  }
  return result;
});

module.exports = old;
