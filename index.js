/*
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
*/

'use strict';

var stream = require('readable-stream')
  , util   = require('util')
  , assert = require('assert')

function ReaDuplexer(writable, readable, options) {
  if (!(this instanceof ReaDuplexer))
    return new ReaDuplexer(writable, readable, options)

  assert(readable)
  assert(writable)

  this._readable = readable
  this._writable = writable

  var that = this
    , dummyWritable = new stream.Writable(options)

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

  ;[readable, writable, dummyWritable].forEach(function(stream) {
    stream.on('error', function(err) {
      that.emit('error', err)
    })
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
