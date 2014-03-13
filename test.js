
var test = require('tap').test
  , stream = require('readable-stream')
  , duplexer = require('./')

test('basically works', function(t) {
  t.plan(2)

  var writable = new stream.Writable()
    , readable = new stream.Readable()
    , instance

  writable._write = function(chunk, enc, cb) {
    t.equal(chunk.toString(), 'writable')
    cb()
  }

  readable._read = function(n) {
    this.push('readable')
    this.push(null)
  }

  instance = duplexer(writable, readable)

  instance.on('data', function(chunk) {
    t.equal(chunk.toString(), 'readable')
  })

  instance.end('writable')
})

test('echo mode', function(t) {
  t.plan(1)

  var writable = new stream.PassThrough()
    , instance

  instance = duplexer(writable, writable)

  instance.on('data', function(chunk) {
    t.equal(chunk.toString(), 'a message')
  })

  instance.end('a message')
})

test('works with a child process', function(t) {
  t.plan(1)

  var echo     = require('child_process').spawn('cat', [], {
                   stdio: ['pipe', 'pipe', process.stderr]
                 })
    , instance = duplexer(echo.stdin, echo.stdout)

  instance.on('data', function(chunk) {
    t.equal(chunk.toString(), 'a message')
  })

  instance.end('a message')
})

test('objectMode', function(t) {
  t.plan(1)

  var writable = new stream.PassThrough({ objectMode: true })
    , instance

  instance = duplexer(writable, writable, { objectMode: true })

  instance.on('data', function(chunk) {
    t.deepEqual(chunk, { hello: 'world' })
  })

  instance.end({ hello: 'world' })
})

test('pass through error events', function(t) {
  // two because it must listen for both readable and
  // writable
  t.plan(2)

  var writable = new stream.PassThrough()
    , instance

  instance = duplexer(writable, writable)

  instance.on('error', function(err) {
    t.ok(err, 'an error is emitted')
  })

  writable.emit('error', new Error('fake!'))
})
