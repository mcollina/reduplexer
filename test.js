
var test      = require('tap').test
  , stream    = require('readable-stream')
  , duplexer  = require('./')
  , http      = require('http')
  , util      = require('util')

function MyWritable(t) {
  stream.Writable.call(this)
  this._t = t
}

util.inherits(MyWritable, stream.Writable)

MyWritable.prototype._write = function(chunk, enc, cb) {
  this._t.equal(chunk.toString(), 'writable')
  cb()
}

function MyReadable() {
  stream.Readable.call(this)
}

util.inherits(MyReadable, stream.Readable)

MyReadable.prototype._read = function(n) {
  this.push('readable')
  this.push(null)
}

test('basically works', function(t) {
  t.plan(2)

  var writable = new MyWritable(t)
    , readable = new MyReadable()
    , instance

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

test('late hook', function(t) {
  t.plan(2)

  var writable = new MyWritable(t)
    , readable = new MyReadable()

    // nothing here, let's hook them up later
    , instance = duplexer()

  instance.on('data', function(chunk) {
    t.equal(chunk.toString(), 'readable')
  })

  instance.end('writable')

  // separate hooks for writable
  instance.hookWritable(writable)
  // and readable
  instance.hookReadable(readable)
})

test('late hook reversed', function(t) {
  t.plan(2)

  var writable = new MyWritable(t)
    , readable = new MyReadable()

    // nothing here, let's hook them up later
    , instance = duplexer()

  instance.on('data', function(chunk) {
    t.equal(chunk.toString(), 'readable')
  })

  instance.end('writable')

  // separate hooks for redable
  instance.hookReadable(readable)
  // and writable
  instance.hookWritable(writable)
})

test('shortcut hook', function(t) {
  t.plan(2)

  var writable = new MyWritable(t)
    , readable = new MyReadable()

    // nothing here, let's hook them up later
    , instance = duplexer()

  instance.on('data', function(chunk) {
    t.equal(chunk.toString(), 'readable')
  })

  instance.end('writable')

  // single hook for both!
  instance.hook(writable, readable)
})

test('double hook', function(t) {
  t.plan(2)

  var writable = new MyWritable(t)
    , readable = new stream.Readable()

    // nothing here, let's hook them up later
    , instance = duplexer()

  writable._write = function(chunk, enc, cb) {
    t.equal(chunk.toString(), 'writable')
    cb()
  }

  readable._read = function(n) {
  }

  instance.hook(writable, readable)

  t.test('writable', function(t) {
    var thrown = false

    try {
      instance.hookWritable(writable)
    } catch(err) {
      thrown = true
    }

    t.assert(thrown, 'must have thrown')

    t.end()
  })

  t.test('readable', function(t) {
    var thrown = false

    try {
      instance.hookReadable(readable)
    } catch(err) {
      thrown = true
    }

    t.assert(thrown, 'must have thrown')

    t.end()
  })

  t.end()
})

test('HTTP support', function(t) {
  t.plan(1)

  var server   = http.createServer()
    , instance = duplexer()

  function handle(req, res) {
    req.pipe(res)
  }

  server.on('request', handle)

  server.on('listening', function() {

    var request = http.request({
        host: 'localhost'
      , port: server.address().port
      , method: 'POST'
      , path: '/'
    })

    request.on('response', function(res) {
      instance.hookReadable(res)
    })

    instance.hookWritable(request)

    instance.end('a message')
  })

  server.listen(0)

  instance.on('data', function(chunk) {
    t.equal(chunk.toString(), 'a message')
    server.close()
  })
})

test('HTTP support with delayed open', function(t) {
  t.plan(1)

  var server   = http.createServer()
    , instance = duplexer()

  function handle(req, res) {
    req.pipe(res)
  }

  server.on('request', handle)

  server.on('listening', function() {

    var request = http.request({
        host: 'localhost'
      , port: server.address().port
      , method: 'POST'
      , path: '/'
    })

    request.on('response', function(res) {
      instance.hookReadable(res)
    })

    instance.hookWritable(request)
  })

  server.listen(0)

  instance.on('data', function(chunk) {
    t.equal(chunk.toString(), 'a message')
    server.close()
  })

  instance.end('a message')
})
