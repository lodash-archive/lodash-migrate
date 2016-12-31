# lodash-migrate v0.3.16

Migrate older [Lodash](https://lodash.com/) code to the latest release.

## Installation

Using npm:

```shell
$ npm i -g npm
$ npm i lodash-migrate
```

In a browser:
```html
<!-- Replace lodash.js with lodash-migrate.js. -->
<script src="path/to/dist/lodash-migrate.js"></script>
<!-- Customize logging. -->
<script>
migrate({
  'log': logger,
  'migrateMessage': migrateTemplate,
  'renameMessage': renameTemplate
});
</script>
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
//   v4.17.4 => '22'
```
