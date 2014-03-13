# reduplexer(writable, readable, options)

[![build status][1]][2]

Takes a [`Writable`][5] stream and a [`Readable`][4] stream and makes them appear as a `Duplex` stream.
Heavily inspired by [duplexer](http://npm.im/duplexer) but using Stream2
with a bundled [readable-stream](http://npm.im/readable-stream).

It is assumed that the two streams are connected to each other in some way.

## Example

```js
var cp = require('child_process')
  , duplex = require('reduplexer')
  , grep = cp.exec('grep Stream')

duplex(grep.stdin, grep.stdout, { objectMode: true })
```

## Installation

`npm install reduplexer --save`

## Tests

`npm test`

## License

Copyright (c) 2014, Matteo Collina <hello@matteocollina.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

  [1]: https://secure.travis-ci.org/mcollina/reduplexer.png
  [2]: https://travis-ci.org/mcollina/reduplexer
  [3]: http://nodejs.org/api/stream.html#stream_class_stream_duplex
  [4]: http://nodejs.org/api/stream.html#stream_class_stream_readable
  [5]: http://nodejs.org/api/stream.html#stream_class_stream_writable
