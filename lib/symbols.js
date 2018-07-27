'use strict'

const setLevelSym = Symbol('pino.setLevel')
const getLevelSym = Symbol('pino.getLevel')
const levelValSym = Symbol('pino.levelVal')

const lsCacheSym = Symbol('pino.lsCache')
const chindingsSym = Symbol('pino.chindings')
const parsedChindingsSym = Symbol('pino.parsedChindings')

const asJsonSym = Symbol('pino.asJson')
const writeSym = Symbol('pino.write')
const serializersSym = Symbol('pino.serializers')
const redactSym = Symbol('pino.redact')

const timeSym = Symbol('pino.time')
const streamSym = Symbol('pino.stream')
const stringifySym = Symbol('pino.stringify')
const stringifiersSym = Symbol('pino.stringifiers')
const endSym = Symbol('pino.end')
const formatOptsSym = Symbol('pino.formatOpts')
const messageKeyStringSym = Symbol('pino.messageKeyString')

const wildcardGsym = Symbol.for('pino.*')
const needsMetadataGsym = Symbol.for('pino.metadata')

module.exports = {
  setLevelSym,
  getLevelSym,
  levelValSym,
  lsCacheSym,
  chindingsSym,
  parsedChindingsSym,
  asJsonSym,
  writeSym,
  serializersSym,
  redactSym,
  timeSym,
  streamSym,
  stringifySym,
  stringifiersSym,
  endSym,
  formatOptsSym,
  messageKeyStringSym,
  wildcardGsym,
  needsMetadataGsym
}
