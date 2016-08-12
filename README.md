# lodash-migrate v0.3.2

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
// Load the older Lodash.
var _ = require('lodash');
// Load lodash-migrate.
require('lodash-migrate');
// Load and customize logging.
require('lodash-migrate')({
  'log': logger,
  'migrateMessage': migrateTemplate,
  'renameMessage': renameTemplate
});

// Later when using API not supported by the latest release.
_.max(['13', '22'], '1');
// => logs:
// lodash-migrate: _.max([ '13', '22' ], '1')
//   v3.10.1 => '13'
//   v4.15.0 => '22'
```

See the [package source](https://github.com/lodash/lodash-migrate/tree/0.3.2) for more details.
