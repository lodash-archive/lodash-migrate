# lodash-migrate v0.2.12

Migrate older [Lodash](https://lodash.com/) code to the latest release.

## Installation

Using npm:

```bash
$ {sudo -H} npm i -g npm
$ npm i lodash-migrate
```

In a browser:
```html
<!-- replace lodash.js with lodash-migrate.js -->
<script src="path/to/dist/lodash-migrate.js"></script>
```

In Node.js:
```js
// load the older lodash
var _ = require('lodash');
// then load lodash-migrate
require('lodash-migrate');
// or load the older lodash using lodash-migrate
var _ = require('lodash-migrate');

// later when using API not supported by the latest lodash release
_.max(['13', '22'], '1');
// => logs:
// lodash-migrate: _.max([ '13', '22' ], '1')
//   v3.10.1 => '13'
//   v4.8.0 => '22'
```

See the [package source](https://github.com/lodash/lodash-migrate/tree/0.2.12) for more details.
