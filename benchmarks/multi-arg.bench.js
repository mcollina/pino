'use strict'

const bench = require('fastbench')
const pino = require('../')
const bunyan = require('bunyan')
const bole = require('bole')('bench')
const winston = require('winston')
const fs = require('fs')
const dest = fs.createWriteStream('/dev/null')
const loglevel = require('./utils/wrap-log-level')(dest)
const plogNodeStream = pino(dest)
delete require.cache[require.resolve('../')]
const plogDest = require('../')(pino.destination('/dev/null'))
delete require.cache[require.resolve('../')]
const plogExtreme = require('../')(pino.extreme('/dev/null'))
delete require.cache[require.resolve('../')]

process.env.DEBUG = 'dlog'
const debug = require('debug')
const dlog = debug('dlog')
dlog.log = function (s) { dest.write(s) }

const deep = require('../package.json')
deep.deep = Object.assign({}, JSON.parse(JSON.stringify(deep)))
deep.deep.deep = Object.assign({}, JSON.parse(JSON.stringify(deep)))
deep.deep.deep.deep = Object.assign({}, JSON.parse(JSON.stringify(deep)))

const blog = bunyan.createLogger({
  name: 'myapp',
  streams: [{
    level: 'trace',
    stream: dest
  }]
})

require('bole').output({
  level: 'info',
  stream: dest
}).setFastTime(true)

const chill = winston.createLogger({
  transports: [
    new winston.transports.Stream({
      stream: fs.createWriteStream('/dev/null')
    })
  ]
})

const max = 10

const run = bench([
  function benchBunyanMulti (cb) {
    for (var i = 0; i < max; i++) {
      blog.info('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchWinstonMulti (cb) {
    for (var i = 0; i < max; i++) {
      chill.log('info', 'hello', 'world')
    }
    setImmediate(cb)
  },
  function benchBoleMulti (cb) {
    for (var i = 0; i < max; i++) {
      bole.info('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchLogLevelMulti (cb) {
    for (var i = 0; i < max; i++) {
      loglevel.info('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchDebugMulti (cb) {
    for (var i = 0; i < max; i++) {
      dlog('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoMulti (cb) {
    for (var i = 0; i < max; i++) {
      plogDest.info('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoExtremeMulti (cb) {
    for (var i = 0; i < max; i++) {
      plogExtreme.info('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoNodeStreamMulti (cb) {
    for (var i = 0; i < max; i++) {
      plogNodeStream.info('hello', 'world')
    }
    setImmediate(cb)
  },
  function benchBunyanInterpolate (cb) {
    for (var i = 0; i < max; i++) {
      blog.info('hello %s', 'world')
    }
    setImmediate(cb)
  },
  function benchWinstonInterpolate (cb) {
    for (var i = 0; i < max; i++) {
      chill.log('info', 'hello %s', 'world')
    }
    setImmediate(cb)
  },
  function benchBoleInterpolate (cb) {
    for (var i = 0; i < max; i++) {
      bole.info('hello %s', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoInterpolate (cb) {
    for (var i = 0; i < max; i++) {
      plogDest.info('hello %s', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoExtremeInterpolate (cb) {
    for (var i = 0; i < max; i++) {
      plogExtreme.info('hello %s', 'world')
    }
    setImmediate(cb)
  },
  function benchPinoNodeStreamInterpolate (cb) {
    for (var i = 0; i < max; i++) {
      plogNodeStream.info('hello %s', 'world')
    }
    setImmediate(cb)
  },
  function benchBunyanInterpolateAll (cb) {
    for (var i = 0; i < max; i++) {
      blog.info('hello %s %j %d', 'world', { obj: true }, 4)
    }
    setImmediate(cb)
  },

  function benchWinstonInterpolateAll (cb) {
    for (var i = 0; i < max; i++) {
      chill.log('info', 'hello %s %j %d', 'world', { obj: true }, 4)
    }
    setImmediate(cb)
  },
  function benchBoleInterpolateAll (cb) {
    for (var i = 0; i < max; i++) {
      bole.info('hello %s %j %d', 'world', { obj: true }, 4)
    }
    setImmediate(cb)
  },
  function benchPinoInterpolateAll (cb) {
    for (var i = 0; i < max; i++) {
      plogDest.info('hello %s %j %d', 'world', { obj: true }, 4)
    }
    setImmediate(cb)
  },
  function benchPinoExtremeInterpolateAll (cb) {
    for (var i = 0; i < max; i++) {
      plogExtreme.info('hello %s %j %d', 'world', { obj: true }, 4)
    }
    setImmediate(cb)
  },
  function benchPinoNodeStreamInterpolateAll (cb) {
    for (var i = 0; i < max; i++) {
      plogNodeStream.info('hello %s %j %d', 'world', { obj: true }, 4)
    }
    setImmediate(cb)
  },
  function benchBunyanInterpolateExtra (cb) {
    for (var i = 0; i < max; i++) {
      blog.info('hello %s %j %d', 'world', { obj: true }, 4, { another: 'obj' })
    }
    setImmediate(cb)
  },
  function benchWinstonInterpolateExtra (cb) {
    for (var i = 0; i < max; i++) {
      chill.log('info', 'hello %s %j %d', 'world', { obj: true }, 4, { another: 'obj' })
    }
    setImmediate(cb)
  },
  function benchBoleInterpolateExtra (cb) {
    for (var i = 0; i < max; i++) {
      bole.info('hello %s %j %d', 'world', { obj: true }, 4, { another: 'obj' })
    }
    setImmediate(cb)
  },
  function benchPinoInterpolateExtra (cb) {
    for (var i = 0; i < max; i++) {
      plogDest.info('hello %s %j %d', 'world', { obj: true }, 4, { another: 'obj' })
    }
    setImmediate(cb)
  },
  function benchPinoExtremeInterpolateExtra (cb) {
    for (var i = 0; i < max; i++) {
      plogExtreme.info('hello %s %j %d', 'world', { obj: true }, 4, { another: 'obj' })
    }
    setImmediate(cb)
  },
  function benchPinoNodeStreamInterpolateExtra (cb) {
    for (var i = 0; i < max; i++) {
      plogNodeStream.info('hello %s %j %d', 'world', { obj: true }, 4, { another: 'obj' })
    }
    setImmediate(cb)
  },
  function benchBunyanInterpolateDeep (cb) {
    for (var i = 0; i < max; i++) {
      blog.info('hello %j', deep)
    }
    setImmediate(cb)
  },
  function benchWinstonInterpolateDeep (cb) {
    for (var i = 0; i < max; i++) {
      chill.log('info', 'hello %j', deep)
    }
    setImmediate(cb)
  },
  function benchBoleInterpolateDeep (cb) {
    for (var i = 0; i < max; i++) {
      bole.info('hello %j', deep)
    }
    setImmediate(cb)
  },
  function benchPinoInterpolateDeep (cb) {
    for (var i = 0; i < max; i++) {
      plogDest.info('hello %j', deep)
    }
    setImmediate(cb)
  },
  function benchPinoExtremeInterpolateDeep (cb) {
    for (var i = 0; i < max; i++) {
      plogExtreme.info('hello %j', deep)
    }
    setImmediate(cb)
  },
  function benchPinoNodeStreamInterpolateDeep (cb) {
    for (var i = 0; i < max; i++) {
      plogNodeStream.info('hello %j', deep)
    }
    setImmediate(cb)
  }
], 10000)

run(run)
