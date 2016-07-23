'use strict';

var _ = require('../lodash'),
    config = require('../lib/config'),
    mapping = require('../lib/mapping'),
    migrate = require('../index'),
    old = require('lodash'),
    QUnit = require('qunit-extras'),
    util = require('../lib/util');

var logs = [],
    reColor = /\x1b\[\d+m/g;

/*----------------------------------------------------------------------------*/

/**
 * Intercepts text written to `stdout`.
 *
 * @private
 * @param {...string} text The test to log.
 */
process.stdout.write = _.wrap(_.bind(process.stdout.write, process.stdout), _.rest(function(func, args) {
  if (_.startsWith(args[0], 'lodash-migrate:')) {
    logs.push(_.trim(args[0]));
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
function migrateText(name, args, oldResult, newResult) {
  return [
    'lodash-migrate: _.' + name + '(' + util.truncate(
      util.inspect(args)
        .match(/^\[\s*([\s\S]*?)\s*\]$/)[1]
        .replace(/\n */g, ' ')
    ) + ')',
    '  v' + old.VERSION + ' => ' + util.truncate(util.inspect(oldResult)),
    '  v' + _.VERSION   + ' => ' + util.truncate(util.inspect(newResult))
  ].join('\n');
}

/**
 * Creates a simulated rename log entry.
 *
 * @private
 * @param {string} name The name of the method called.
 * @returns {string} Returns the simulated log entry.
 */
function renameText(name) {
  var newName = mapping.rename[name] || name;
  return [
    'lodash-migrate: Method renamed',
    '  v' + old.VERSION + ' => _.' + name,
    '  v' + _.VERSION   + ' => _.' + newName
  ].join('\n');
}

/*----------------------------------------------------------------------------*/

QUnit.testStart(function() {
  logs.length = 0;
});

QUnit.module('lodash-migrate');

/*----------------------------------------------------------------------------*/

QUnit.module('logging method');

(function() {
  QUnit.test('should be configurable', function(assert) {
    assert.expect(1);

    var objects = [{ 'a': 1 }, { 'a': 2 }, { 'a': 3 }],
        expected = migrateText('max', [objects, 'a'], objects[2], objects[0]);

    migrate({
      'log': function(message) {
        assert.deepEqual(message, expected);
      }
    });

    old.max(objects, 'a');
    migrate(config);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('iteration method');

(function() {
  QUnit.test('should not invoke `iteratee` in new lodash', function(assert) {
    assert.expect(8);

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
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('missing methods');

(function() {
  QUnit.test('should not error on legacy `_.callback` use', function(assert) {
    assert.expect(1);

    old.callback('x');
    assert.deepEqual(logs, []);
  });

  QUnit.test('should not error on legacy `_.contains` use', function(assert) {
    assert.expect(1);

    old([1, 2, 3]).contains(2);
    assert.deepEqual(logs, [renameText('contains')]);
  });

  QUnit.test('should not error on legacy `_.indexBy` use', function(assert) {
    assert.expect(1);

    var object = { 'a': 'x' };

    old(object).indexBy(_.identity).value();
    assert.deepEqual(logs, [renameText('indexBy')]);
  });

  QUnit.test('should not error on legacy `_#run` use', function(assert) {
    assert.expect(1);

    old(1).run();
    assert.deepEqual(logs, [renameText('run')]);
  });

  QUnit.test('should not error on legacy `_.trunc` use', function(assert) {
    assert.expect(1);

    var string = 'abcdef',
        expected = [renameText('trunc'), migrateText('trunc', [string, 3], '...', 'abcdef')];

    old(string).trunc(3);
    assert.deepEqual(logs, expected);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('mutator methods');

(function() {
  QUnit.test('should clone arguments before invoking methods', function(assert) {
    assert.expect(1);

    var array = [1, 2, 3];

    old.remove(array, function(value, index) {
      return index == 0;
    });

    assert.deepEqual(array, [2, 3]);
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

QUnit.module('old.defer');

(function() {
  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old.defer(_.identity);
    assert.deepEqual(logs, []);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.delay');

(function() {
  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old.delay(_.identity, 1);
    assert.deepEqual(logs, []);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.mixin');

(function() {
  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old.mixin();
    assert.deepEqual(logs, []);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.now');

(function() {
  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old.now();
    assert.deepEqual(logs, []);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.random');

(function() {
  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old.random();
    assert.deepEqual(logs, []);
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

  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old.runInContext();
    assert.deepEqual(logs, []);
  });

  QUnit.test('should wrap results', function(assert) {
    assert.expect(1);

    var lodash = old.runInContext(),
        objects = [{ 'b': 1 }, { 'b': 2 }, { 'b': 3 }],
        expected = migrateText('max', [objects, 'b'], objects[2], objects[0]);

    lodash.max(objects, 'b');
    assert.strictEqual(_.last(logs), expected);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.sample');

(function() {
  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old.sample([1, 2, 3]);
    assert.deepEqual(logs, []);
  });

  QUnit.test('should work when chaining', function(assert) {
    assert.expect(2);

    var array = [1],
        wrapped = old(array);

    assert.strictEqual(wrapped.sample(), 1);
    assert.deepEqual(wrapped.sample(1).value(), [1]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.shuffle');

(function() {
  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old.shuffle([1, 2, 3]);
    assert.deepEqual(logs, []);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.times');

(function() {
  QUnit.test('should only invoke `iteratee` in new lodash when it contains a `return` statement', function(assert) {
    assert.expect(2);

    var count= 0;
    old.times(1, function() { count++; });
    assert.strictEqual(count, 1);

    count = 0;
    old.times(1, function() { count++; return; });
    assert.strictEqual(count, 2);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old.uniqueId');

(function() {
  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old.uniqueId();
    assert.deepEqual(logs, []);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('old#valueOf');

(function() {
  QUnit.test('should not log', function(assert) {
    assert.expect(1);

    old([1]).valueOf();
    assert.deepEqual(logs, []);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('logging');

(function() {
  function Foo(key) {
    this[key] = _.noop;
  }
  Foo.prototype.$ = _.noop;

  QUnit.test('should log when using unsupported static API', function(assert) {
    assert.expect(1);

    var objects = [{ 'c': 1 }, { 'c': 2 }, { 'c': 3 }],
        expected = [migrateText('max', [objects, 'c'], objects[2], objects[0])];

    old.max(objects, 'c');
    assert.deepEqual(logs, expected);
  });

  QUnit.test('should log a specific message once', function(assert) {
    assert.expect(2);

    var foo = new Foo('a'),
        expected = [migrateText('functions', [foo], ['a', '$'], ['a'])];

    old.functions(foo);
    assert.deepEqual(logs, expected);

    old.functions(foo);
    assert.deepEqual(logs, expected);
  });

  QUnit.test('should not log when both lodashes produce uncomparable values', function(assert) {
    assert.expect(2);

    function Bar(a) { this.a = a; }
    var counter = 0;

    old.times(2, function() {
      return new Bar(counter++);
    });

    assert.deepEqual(logs, []);

    old.curry(function(a, b, c) {
      return [a, b, c];
    });

    assert.deepEqual(logs, []);
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
    assert.ok(reColor.test(_.last(logs)));

    global.document = {};
    paths.forEach(clear);
    require('../index.js');

    old.functions(new Foo('c'));
    assert.ok(!reColor.test(_.last(logs)));

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
QUnit.start();
