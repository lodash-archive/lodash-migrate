var _ = require('lodash-compat'),
    old = require('lodash'),
    inspect = _.partial(require('util').inspect, _, { 'colors': true }),
    trunc = _.partial(_.trunc, _, 80);

var lastLog,
    reColor = /\x1b\[\d+m/g;

global.QUnit = require('qunitjs');
require('qunit-extras').runInContext(global);

QUnit.testStart(function() {
  lastLog = undefined;
});

/*----------------------------------------------------------------------------*/

/**
 * Intercepts text written to `stdout`.
 *
 * @private
 * @param {...string} text The test to log.
 */
process.stdout.write = _.wrap(_.bind(process.stdout.write, process.stdout), function(func) {
  var args = _.slice(arguments, 1);
  if (_.startsWith(args[0], 'lodash-migrate:')) {
    lastLog = _.trim(args[0].replace(reColor, ''));
  } else {
    func.apply(null, args);
  }
});

/**
 * Creates a simulated lodash-migrate log entry.
 *
 * @private
 * @param {string} name The name of the method called.
 * @param {Array} args The arguments provided to the method called.
 * @param {*} oldResult The result from the older version of lodash.
 * @param {*} newResult The result from the newer version of lodash.
 * @returns {string} Returns the simulated log entry.
 */
function makeEntry(name, args, oldResult, newResult) {
  args = inspect(args).match(/^\[\s*([\s\S]*?)\s*\]$/)[1];
  args = args.replace(/\n */g, ' ');
  return [
    'lodash-migrate: _.' + name + '(' + trunc(args) + ')',
    '  v' + old.VERSION + ' => ' + trunc(inspect(oldResult)),
    '  v' + _.VERSION   + ' => ' + trunc(inspect(newResult))
  ]
  .join('\n')
  .replace(reColor, '');
}

/*----------------------------------------------------------------------------*/

QUnit.module('lodash-migrate');

(function() {
  test('should return older lodash', 1, function() {
    strictEqual(require('../index.js'), old);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('logging');

(function() {
  var array = [1, 2, 3],
      lessThanTwo = function(value) { return value < 2; },
      greaterThanTwo = function(value) { return value > 2; };

  test('should log when using unsupported static API', 13, function() {
    old.clone(_.noop);
    deepEqual(lastLog, makeEntry('clone', [_.noop], _.noop, {}));

    old.first(array, 2);
    deepEqual(lastLog, makeEntry('first', [array, 2], [1, 2], 1));

    old.first(array, lessThanTwo);
    deepEqual(lastLog, makeEntry('first', [array, lessThanTwo], [1], 1));

    var nested = [1, [2, [3]]];
    old.flatten(nested);
    deepEqual(lastLog, makeEntry('flatten', [nested], [1, 2, 3], [1, 2, [3]]));

    var object = { 'c': _.noop, 'b': _.noop, 'a': _.noop };
    old.functions(object);
    deepEqual(lastLog, makeEntry('functions', [object], ['a', 'b', 'c'], ['c', 'b', 'a']));

    old.initial(array, 2);
    deepEqual(lastLog, makeEntry('initial', [array, 2], [1], [1, 2]));

    old.isFinite('1');
    deepEqual(lastLog, makeEntry('isFinite', ['1'], true, false));

    old.keys('hi');
    deepEqual(lastLog, makeEntry('keys', ['hi'], [], ['0', '1']));

    old.last(array, 2);
    deepEqual(lastLog, makeEntry('last', [array, 2], [2, 3], 3));

    old.last(array, greaterThanTwo);
    deepEqual(lastLog, makeEntry('last', [array, greaterThanTwo], [3], 3));

    old.rest(array, 2);
    deepEqual(lastLog, makeEntry('rest', [array, 2], [3], [2, 3]));

    var string = '<%= o.a %>',
        options = { 'variable': 'o' },
        data = { 'a': 'b' };

    old.template(string, data, options);
    deepEqual(lastLog, makeEntry('template', [string, data, options], 'b', _.template(string, data, options)));

    var zipped = [['a'], [1]];
    old.zip(zipped);
    deepEqual(lastLog, makeEntry('zip', [zipped], [['a', 1]], [[['a']], [[1]]]));
  });

  test('should log when using unsupported chaining API', 1, function() {
    old(array).first(2);
    deepEqual(lastLog, makeEntry('first', [array, 2, undefined], [1, 2], 1));
  });

  test('should log a specific message once', 2, function() {
    old.keys('once');
    deepEqual(lastLog, makeEntry('keys', ['once'], [], ['0', '1', '2', '3']));

    lastLog = undefined;
    old.keys('once');
    strictEqual(lastLog, undefined);
  });

  test('should not log when both lodashs produce functions', 1, function() {
    var curried = _.curry(function(a, b, c) {
      return [a, b, c];
    });

    strictEqual(lastLog, undefined);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.config.asyncRetries = 10;
QUnit.config.hidepassed = true;
QUnit.config.noglobals = true;
QUnit.load();
