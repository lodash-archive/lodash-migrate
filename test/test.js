var _ = require('../lodash'),
    old = require('lodash'),
    util = require('../lib/util');

var reColor = /\x1b\[\d+m/g;

global.QUnit = require('qunitjs');
require('qunit-extras').runInContext(global);

var lastLog;
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
process.stdout.write = _.wrap(_.bind(process.stdout.write, process.stdout), _.rest(function(func, args) {
  if (_.startsWith(args[0], 'lodash-migrate:')) {
    lastLog = _.trim(args[0]);
  } else {
    func.apply(null, args);
  }
}));

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
  args = util.inspect(args).match(/^\[\s*([\s\S]*?)\s*\]$/)[1];
  args = args.replace(/\n */g, ' ');
  return [
    'lodash-migrate: _.' + name + '(' + util.truncate(args) + ')',
    '  v' + old.VERSION + ' => ' + util.truncate(util.inspect(oldResult)),
    '  v' + _.VERSION   + ' => ' + util.truncate(util.inspect(newResult))
  ].join('\n');
}

/*----------------------------------------------------------------------------*/

QUnit.module('lodash-migrate');

(function() {
  QUnit.test('should return older lodash', function(assert) {
    assert.expect(1);

    assert.strictEqual(require('../index.js'), old);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('iteration method');

(function() {
  QUnit.test('should not double up on `iteratee` invocations', function(assert) {
    assert.expect(9);

    var count,
        array = [1],
        object = { 'a': 1 },
        iteratee = function() { count++; };

    _.each(['each', 'eachRight', 'forEach', 'forEachRight'], function(methodName) {
      count = 0;
      old[methodName](array, iteratee);
      assert.strictEqual(count, 1, methodName);
    });

    _.each(['forIn', 'forInRight', 'forOwn', 'forOwnRight'], function(methodName) {
      count = 0;
      old[methodName](object, iteratee);
      assert.strictEqual(count, 1, methodName);
    });

    count = 0;
    old.times(1, iteratee);
    assert.strictEqual(count, 1, 'times');
  });

  QUnit.test('should invoke `iteratee` in new lodash when it contains a `return` statement', function(assert) {
    assert.expect(9);

    var count,
        array = [1],
        object = { 'a': 1 },
        iteratee = function() { count++; return; };

    _.each(['each', 'eachRight', 'forEach', 'forEachRight'], function(methodName) {
      count = 0;
      old[methodName](array, iteratee);
      assert.strictEqual(count, 2, methodName);
    });

    _.each(['forIn', 'forInRight', 'forOwn', 'forOwnRight'], function(methodName) {
      count = 0;
      old[methodName](object, iteratee);
      assert.strictEqual(count, 2, methodName);
    });

    count = 0;
    old.times(1, iteratee);
    assert.strictEqual(count, 2, 'times');
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('missing methods');

(function() {
  QUnit.test('should not error on legacy `_.callback` use', function(assert) {
    assert.expect(1);

    old.callback('x');
    assert.strictEqual(lastLog, undefined);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('mutator methods');

(function() {
  QUnit.test('should clone arguments before invoking methods', function(assert) {
    assert.expect(1);

    var array = [1, 2, 3];

    old.remove(array, function(value) {
      return value == 2;
    });

    assert.strictEqual(lastLog, undefined);
  });

  QUnit.test('should not double up on value mutations', function(assert) {
    assert.expect(1);

    var array = [1, 2, 3],
        lastIndex = 0;

    old.remove(array, function(value, index) {
      if (lastIndex > index) {
        return true;
      }
      lastIndex = index;
    });

    assert.deepEqual(array, [1, 2, 3]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.runInContext');

(function() {
  QUnit.test('should accept a `context` argument', function(assert) {
    assert.expect(1);

    var count = 0;

    var now = function() {
      count++;
      return Date.now();
    };

    var lodash = old.runInContext({
      'Date': function() {
        return { 'getTime': now };
      }
    });

    lodash.now();
    assert.strictEqual(count, 1);
  });

  QUnit.test('should wrap results', function(assert) {
    assert.expect(1);

    var lodash = old.runInContext(),
        objects = [{ 'a': 1 }, { 'a': 2 }, { 'a': 3 }];

    lodash.max(objects, 'a');
    assert.deepEqual(lastLog, makeEntry('max', [objects, 'a'], objects[2], objects[0]));
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.sample');

(function() {
  QUnit.test('should work when chaining', function(assert) {
    assert.expect(2);

    var array = [1],
        wrapped = old(array);

    assert.strictEqual(wrapped.sample(), 1);
    assert.deepEqual(wrapped.sample(1).value(), [1]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('logging');

(function() {
  function Foo(key) {
    this[key] = function() {};
  }
  Foo.prototype.$ = function() {};

  QUnit.test('should log when using unsupported static API', function(assert) {
    assert.expect(1);

    var objects = [{ 'b': 1 }, { 'b': 2 }, { 'b': 3 }];

    old.max(objects, 'b');
    assert.deepEqual(lastLog, makeEntry('max', [objects, 'b'], objects[2], objects[0]));
  });

  QUnit.test('should log when using unsupported chaining API', function(assert) {
    assert.expect(1);

    var string = 'abcdef',
        error = _.attempt(function(x) { x.apply(); });

    old(string).trunc(3);
    assert.deepEqual(lastLog, makeEntry('trunc', [string, 3], '...', error));
  });

  QUnit.test('should log a specific message once', function(assert) {
    assert.expect(2);

    var foo = new Foo('a');
    old.functions(foo);
    assert.deepEqual(lastLog, makeEntry('functions', [foo], ['a', '$'], ['a']));

    lastLog = undefined;
    old.functions(foo);
    assert.strictEqual(lastLog, undefined);
  });

  QUnit.test('should not log when both lodashes produce uncomparable values', function(assert) {
    assert.expect(2);

    function Bar(a) { this.a = a; }
    var counter = 0;

    old.times(2, function() {
      return new Bar(counter++);
    });

    assert.strictEqual(lastLog, undefined);

    old.curry(function(a, b, c) {
      return [a, b, c];
    });

    assert.strictEqual(lastLog, undefined);
  });

  QUnit.test('should not include ANSI escape codes in logs when in the browser', function(assert) {
    assert.expect(2);

    var paths = [
      '../index.js',
      '../lib/util.js'
    ];

    function clear(id) {
      delete require.cache[require.resolve(id)];
    }

    old.functions(new Foo('b'));
    assert.ok(reColor.test(lastLog));

    global.document = {};
    paths.forEach(clear);
    require('../index.js');

    old.functions(new Foo('c'));
    assert.ok(!reColor.test(lastLog));

    delete global.document;
    paths.forEach(clear);
    require('../index.js');
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.config.asyncRetries = 10;
QUnit.config.hidepassed = true;
QUnit.config.noglobals = true;
QUnit.load();
