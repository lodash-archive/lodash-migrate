'use strict';

var _ = require('./lodash'),
    config = _.clone(require('./lib/config')),
    listing = require('./lib/listing'),
    mapping = require('./lib/mapping'),
    old = require('lodash'),
    util = require('./lib/util');

var reHasReturn = /\breturn\b/;

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
  var methodNames = _.functions(oldDash),
      unwrapped = listing.unwrapped,
      wrapped = _.difference(methodNames, unwrapped, listing.seqFuncs),
      oldRunInContext = oldDash.runInContext;

  // Wrap methods.
  _.each([unwrapped, wrapped], function(names, index) {
    oldDash.mixin(_.transform(names, function(source, name) {
      source[name] = wrapMethod(oldDash, newDash, name);
    }, {}), !!index);
  });

  // Wrap `_.runInContext.
  oldDash.runInContext = function(context) {
    return wrapLodash(oldRunInContext(context), newDash);
  };

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

  // Wrap chain sequence methods.
  _.each(listing.seqFuncs, function(name) {
    if (oldDash.prototype[name]) {
      oldDash.prototype[name] = wrapMethod(oldDash, newDash, name);
    }
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
  var ignoreRename = _.includes(listing.ignored.rename, name),
      ignoreResult = _.includes(listing.ignored.result, name),
      isSeqFunc = _.includes(listing.seqFuncs, name);

  var newName = mapping.rename[name] || name,
      newFunc = isSeqFunc ? newDash.prototype[newName] : newDash[newName],
      newVer  = newDash.VERSION,
      oldFunc = isSeqFunc ? oldDash.prototype[name] : oldDash[name],
      oldVer  = oldDash.VERSION;

  return _.wrap(oldFunc, _.rest(function(oldFunc, args) {
    var that = this;

    var data = {
      'name': name,
      'args': util.truncate(
        util.inspect(args)
          .match(/^\[\s*([\s\S]*?)\s*\]$/)[1]
          .replace(/\n */g, ' ')
      ),
      'oldData': {
        'name': name,
        'version': oldVer
      },
      'newData': {
        'name': newName,
        'version': newVer
      }
    };

    if (!ignoreRename && mapping.rename[name]) {
      config.log(config.renameMessage(data));
    }
    if (ignoreResult) {
      return oldFunc.apply(that, args);
    }
    var argsClone = util.cloneDeep(args),
        isIteration = mapping.iteration[name];

    if (isIteration &&
        !(isIteration.mappable && reHasReturn.test(argsClone[1]))) {
      argsClone[1] = _.identity;
    }
    var oldResult = oldFunc.apply(that, args),
        newResult = _.attempt(function() { return newFunc.apply(that, argsClone); });

    if (util.isComparable(oldResult)
          ? !util.isEqual(oldResult, newResult)
          : util.isComparable(newResult)
        ) {
      config.log(config.migrateMessage(_.merge(data, {
        'oldData': { 'result': util.truncate(util.inspect(oldResult)) },
        'newData': { 'result': util.truncate(util.inspect(newResult)) }
      })));
    }
    return oldResult;
  }));
}

/*----------------------------------------------------------------------------*/

wrapLodash(old, _);

module.exports = _.partial(_.assign, config);
