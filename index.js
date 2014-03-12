
var stream = require('readable-stream')
  , util   = require('util')
  , assert = require('assert')

function ReaDuplexer(readable, writable, options) {
  if (!(this instanceof ReaDuplexer))
    return new ReaDuplexer(readable, writable, options)

  assert(readable)
  assert(writable)

  this._readable = readable
  this._writable = writable

  var that = this
    , dummyWritable = new stream.Writable()

  dummyWritable._write = function dummyWrite(chunk, enc, cb) {
    if (that.push(chunk, enc))
      cb()
    else
      that._lastReadCallback = cb
  }

  dummyWritable.on('finish', function() {
    that.push(null)
  })

  writable.on('drain', function() {
    that.emit('drain')
  })

  this.on('finish', function() {
    writable.end()
  })

  readable.pipe(dummyWritable)

  stream.Duplex.call(this, options)
}

util.inherits(ReaDuplexer, stream.Duplex)

ReaDuplexer.prototype._read = function read(n) {
  if (this._lastReadCallback)
    this._lastReadCallback()

  this._lastReadCallback = null
}

ReaDuplexer.prototype._write = function write(chunk, enc, cb) {
  return this._writable.write(chunk, enc, cb)
}

module.exports = ReaDuplexer
