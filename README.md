# lodash-migrate v0.2.4

Migrate older [lodash](https://lodash.com/) code to the latest release.

## Installation

Using npm:

```bash
$ {sudo -H} npm i -g npm
$ npm i lodash-migrate
```

In Node.js:

```js
// load the older lodash
var _ = require('lodash');
// load lodash-migrate after
require('lodash-migrate');

// later when using API not supported by the latest lodash release
_.max(['13', '22'], '1');
// => logs:
// lodash-migrate: _.max([ '13', '22'...)
//   v3.10.1 => '13'
//   v4.2.0 => '22'
```

See the [package source](https://github.com/lodash/lodash-migrate/tree/0.2.4) for more details.
