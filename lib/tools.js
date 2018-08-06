'use strict'

const format = require('quick-format-unescaped')
const { mapHttpRequest, mapHttpResponse } = require('pino-std-serializers')
const SonicBoom = require('sonic-boom')
const stringifySafe = require('fast-safe-stringify')
const {
  lsCacheSym,
  chindingsSym,
  parsedChindingsSym,
  writeSym,
  messageKeyStringSym,
  serializersSym,
  formatOptsSym,
  endSym,
  stringifiersSym,
  stringifySym,
  needsMetadataGsym,
  wildcardGsym,
  streamSym
} = require('./symbols')

function noop () {}

function genLog (z) {
  return function LOG (o, ...n) {
    if (typeof o === 'object' && o !== null) {
      if (o.method && o.headers && o.socket) {
        o = mapHttpRequest(o)
      } else if (typeof o.setHeader === 'function') {
        o = mapHttpResponse(o)
      }
      this[writeSym](o, format(null, n, this[formatOptsSym]), z)
    } else this[writeSym](null, format(o, n, this[formatOptsSym]), z)
  }
}

// magically escape strings for json
// relying on their charCodeAt
// everything below 32 needs JSON.stringify()
// 34 and 92 happens all the time, so we
// have a fast case for them
function asString (str) {
  var result = ''
  var last = 0
  var found = false
  var point = 255
  const l = str.length
  if (l > 100) {
    return JSON.stringify(str)
  }
  for (var i = 0; i < l && point >= 32; i++) {
    point = str.charCodeAt(i)
    if (point === 34 || point === 92) {
      result += str.slice(last, i) + '\\'
      last = i
      found = true
    }
  }
  if (!found) {
    result = str
  } else {
    result += str.slice(last)
  }
  return point < 32 ? JSON.stringify(str) : '"' + result + '"'
}

function asJson (obj, msg, num, time) {
  // to catch both null and undefined
  const hasObj = obj !== undefined && obj !== null
  const objError = hasObj && obj instanceof Error
  msg = !msg && objError === true ? obj.message : msg || undefined
  const stringify = this[stringifySym]
  const stringifiers = this[stringifiersSym]
  const end = this[endSym]
  const messageKeyString = this[messageKeyStringSym]
  const chindings = this[chindingsSym]
  const serializers = this[serializersSym]
  var data = this[lsCacheSym][num] + time
  if (msg !== undefined) {
    data += messageKeyString + asString('' + msg)
  }
  // we need the child bindings added to the output first so instance logged
  // objects can take precedence when JSON.parse-ing the resulting log line
  data = data + chindings
  var value
  if (hasObj === true) {
    var notHasOwnProperty = obj.hasOwnProperty === undefined
    if (objError === true) {
      data += ',"type":"Error"'
      if (obj.stack !== undefined) {
        data += ',"stack":' + stringify(obj.stack)
      }
    }
    // if global serializer is set, call it first
    if (serializers[wildcardGsym]) {
      obj = serializers[wildcardGsym](obj)
    }
    for (var key in obj) {
      value = obj[key]
      if ((notHasOwnProperty || obj.hasOwnProperty(key)) && value !== undefined) {
        value = serializers[key] ? serializers[key](value) : value

        switch (typeof value) {
          case 'undefined': continue
          case 'number':
          case 'boolean':
            if (stringifiers[key]) value = stringifiers[key](value)
            data += ',"' + key + '":' + value
            continue
          case 'string':
            value = (stringifiers[key] || asString)(value)
            break
          default:
            value = (stringifiers[key] || stringify)(value)
        }
        if (value === undefined) continue
        data += ',"' + key + '":' + value
      }
    }
  }
  return data + end
}

function asChindings (instance, bindings) {
  if (!bindings) {
    throw Error('missing bindings for child Pino')
  }
  var key
  var value
  var data = instance[chindingsSym]
  const stringify = instance[stringifySym]
  const stringifiers = instance[stringifiersSym]
  const serializers = instance[serializersSym]
  if (serializers[wildcardGsym]) {
    bindings = serializers[wildcardGsym](bindings)
  }
  for (key in bindings) {
    value = bindings[key]
    const valid = key !== 'level' &&
      key !== 'serializers' &&
      key !== 'customLevels' &&
      bindings.hasOwnProperty(key) &&
      value !== undefined
    if (valid === true) {
      value = serializers[key] ? serializers[key](value) : value
      data += ',"' + key + '":' + (stringifiers[key] || stringify)(value)
    }
  }
  return data
}

function getPrettyStream (opts, prettifier, dest) {
  if (prettifier && typeof prettifier === 'function') {
    return prettifierMetaWrapper(prettifier(opts), dest)
  }
  try {
    var prettyFactory = require('pino-pretty')
    prettyFactory.asMetaWrapper = prettifierMetaWrapper
    return prettifierMetaWrapper(prettyFactory(opts), dest)
  } catch (e) {
    throw Error('Missing `pino-pretty` module: `pino-pretty` must be installed separately')
  }
}

function prettifierMetaWrapper (pretty, dest) {
  return {
    [needsMetadataGsym]: true,
    lastLevel: 0,
    lastMsg: null,
    lastObj: null,
    lastLogger: null,
    write (chunk) {
      var chindings = this.lastLogger[parsedChindingsSym]

      if (!chindings) {
        chindings = JSON.parse('{"v":1' + this.lastLogger[chindingsSym] + '}')
        this.lastLogger[parsedChindingsSym] = chindings
      }

      const obj = Object.assign({
        level: this.lastLevel,
        msg: this.lastMsg,
        time: this.lastTime
      }, chindings, this.lastObj)

      const formatted = pretty(obj)
      if (formatted === undefined) return
      dest.write(formatted)
    }
  }
}

function createArgsNormalizer (defaultOptions) {
  return function normalizeArgs (opts = {}, stream) {
    // support stream as a string
    if (typeof opts === 'string') {
      stream = new SonicBoom(opts)
      opts = {}
    }
    if (typeof stream === 'string') {
      stream = new SonicBoom(stream)
      opts = {}
    }
    if (opts instanceof SonicBoom || opts.writable || opts._writableState) {
      stream = opts
      opts = null
    }
    opts = Object.assign({}, defaultOptions, opts)
    if ('extreme' in opts) {
      throw Error('The extreme option has been removed, use pino.extreme instead')
    }
    if ('onTerminated' in opts) {
      throw Error('The onTerminated option has been removed, use pino.final instead')
    }
    const { enabled, prettyPrint, prettifier, messageKey } = opts
    if (enabled === false) opts.level = 'silent'
    stream = stream || process.stdout
    if (stream === process.stdout && stream.fd >= 0) {
      stream = new SonicBoom(stream.fd)
    }
    if (prettyPrint) {
      const prettyOpts = Object.assign({ messageKey }, prettyPrint)
      stream = getPrettyStream(prettyOpts, prettifier, stream)
    }
    return { opts, stream }
  }
}

function final (logger, handler) {
  if (typeof logger === 'undefined' || typeof logger.child !== 'function') {
    throw Error('expected a pino logger instance')
  }
  if (typeof handler !== 'function') {
    throw Error('expected a handler function')
  }
  const stream = logger[streamSym]
  if (!(stream instanceof SonicBoom)) {
    throw Error('only compatible with loggers with pino.destination and pino.extreme targets')
  }

  return (err = null, ...args) => {
    try {
      stream.flushSync()
    } catch (e) {
      // it's too late to wait for the stream to be ready
      // because this is a final tick scenario.
      // in practice there shouldn't be a situation where it isn't
      // however, swallow the error just in case (and for easier testing)
    }
    const finalLogger = new Proxy(logger, {
      get: (logger, key) => {
        if (key in logger.levels.values) {
          return (...args) => {
            logger[key](...args)
            stream.flushSync()
          }
        }
        return logger[key]
      }
    })
    return handler(err, finalLogger, ...args)
  }
}

function stringify (obj) {
  try {
    return JSON.stringify(obj)
  } catch (_) {
    return stringifySafe(obj)
  }
}

module.exports = {
  noop,
  getPrettyStream,
  asChindings,
  asJson,
  genLog,
  createArgsNormalizer,
  final,
  stringify
}
