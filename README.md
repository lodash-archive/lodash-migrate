# lodash-migrate v0.1.6

Migrate older [lodash](https://lodash.com/) code to the latest release.

## Installation

Using npm:

```bash
$ {sudo -H} npm i -g npm
$ npm i lodash-migrate
```

In Node.js/io.js:

```js
// load the older lodash
var _ = require('lodash');
// load lodash-migrate after
require('lodash-migrate');

// later when using API not supported by the latest lodash release
_.first([1, 2, 3], 2);
// => logs:
// lodash-migrate: _.first([ 1, 2, 3 ], 2)
//   v2.4.1 => [ 1, 2 ]
//   v3.0.0 => 1
```

See the [package source](https://github.com/lodash/lodash-migrate/tree/0.1.6) for more details.
