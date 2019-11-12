'use strict'
// **Github:** https://github.com/fidm/quic
//
// **License:** MIT

import { Readable } from 'stream'
import { createHash, Hash, randomBytes } from 'crypto'
import { suite, it } from 'tman'
import { ok, strictEqual } from 'assert'

import { Visitor, BufferVisitor, Float16MaxValue,
  readUFloat16, writeUFloat16, readUnsafeUInt, writeUnsafeUInt,
} from '../src/internal/common'

export function bufferFromBytes (array: any) {
  const bytes = []
  if (!Array.isArray(array)) {
    array = [array]
  }
  for (const val of array) {
    if (typeof val !== 'string') {
      bytes.push(val)
    } else {
      for (const byte of Buffer.from(val, 'utf8').values()) {
        bytes.push(byte)
      }
    }
  }
  return Buffer.from(bytes)
}

export class RandDataStream extends Readable {
  readBytes: number
  totalSize: number
  sum: string
  sha256: Hash
  constructor (totalSize: number) {
    if (!Number.isSafeInteger(totalSize) || totalSize <= 0) {
      throw new Error(`invalid bytes size: ${totalSize}`)
    }
    super()
    this.readBytes = 0
    this.totalSize = totalSize
    this.sum = ''
    this.sha256 = createHash('sha256')
  }

  _read (_size: number = 0) {
    let data = randBuffer(2048)
    if (this.totalSize - this.readBytes < data.length) {
      data = data.slice(0, this.totalSize - this.readBytes)
    }
    if (data.length > 0) {
      this.sha256.update(data)
      this.push(data)
      this.readBytes += data.length
    }
    if (this.readBytes >= this.totalSize) {
      this.sum = this.sha256.digest('hex')
      this.push(null)
    }
  }
}

function randBuffer (max: number): Buffer {
  return randomBytes(Math.max(Math.ceil(Math.random() * max)))
}

suite('common', function () {
  it('bufferFromBytes', function () {
    ok(bufferFromBytes(0xff).equals(Buffer.from([0xff])))
    ok(bufferFromBytes([0xff]).equals(Buffer.from([0xff])))
    ok(bufferFromBytes([0xff, 0x00]).equals(Buffer.from([0xff, 0x00])))
    ok(bufferFromBytes(['a', 'b']).equals(Buffer.from([0x61, 0x62])))
    ok(bufferFromBytes(['ab', 'c', 0x64]).equals(Buffer.from([0x61, 0x62, 0x63, 0x64])))
  })

  it('Visitor', function () {
    const v = new Visitor(0)
    strictEqual(v.start, 0)
    strictEqual(v.end, 0)
    v.walk(10)
    strictEqual(v.start, 0)
    strictEqual(v.end, 10)
    v.walk(100)
    strictEqual(v.start, 10)
    strictEqual(v.end, 110)
    v.reset(10)
    strictEqual(v.start, 10)
    strictEqual(v.end, 110)
    v.reset(20, 20)
    strictEqual(v.start, 20)
    strictEqual(v.end, 20)
    v.reset(0, 200)
    strictEqual(v.start, 0)
    strictEqual(v.end, 200)
    v.reset(0, 0)
    strictEqual(v.start, 0)
    strictEqual(v.end, 0)
  })

  it('BufferVisitor', function () {
    const bufv = new BufferVisitor(Buffer.allocUnsafe(10))
    bufv.walk(1)
    bufv.walk(4)
    writeUnsafeUInt(bufv.buf, 0, bufv.start, bufv.end - bufv.start)
    bufv.walk(4)
    writeUnsafeUInt(bufv.buf, 0, bufv.start, bufv.end - bufv.start)
    bufv.reset()
    bufv.walk(1)
    bufv.walk(8)
    strictEqual(readUnsafeUInt(bufv.buf, bufv.start, bufv.end - bufv.start), 0)
  })

  suite('UFloat16', function () {
    function uint16Buf (val: number) {
      const buf = Buffer.alloc(2)
      buf.writeUInt16BE(val, 0)
      return buf
    }

    it('Float16MaxValue, readUFloat16, writeUFloat16', function () {
      const buf = Buffer.from([0xff, 0xff])
      strictEqual(readUFloat16(buf), Float16MaxValue)
      ok(writeUFloat16(Buffer.alloc(2), readUFloat16(buf), 0).equals(buf))
    })

    it('writeUFloat16', function () {
      const testCases = [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
        [6, 6],
        [7, 7],
        [15, 15],
        [31, 31],
        [42, 42],
        [123, 123],
        [1234, 1234],
        // Check transition through 2^11.
        [2046, 2046],
        [2047, 2047],
        [2048, 2048],
        [2049, 2049],
        // Running out of mantissa at 2^12.
        [4094, 4094],
        [4095, 4095],
        [4096, 4096],
        [4097, 4096],
        [4098, 4097],
        [4099, 4097],
        [4100, 4098],
        [4101, 4098],
        // Check transition through 2^13.
        [8190, 6143],
        [8191, 6143],
        [8192, 6144],
        [8193, 6144],
        [8194, 6144],
        [8195, 6144],
        [8196, 6145],
        [8197, 6145],
        // Half-way through the exponents.
        [0x7FF8000, 0x87FF],
        [0x7FFFFFF, 0x87FF],
        [0x8000000, 0x8800],
        [0xFFF0000, 0x8FFF],
        [0xFFFFFFF, 0x8FFF],
        [0x10000000, 0x9000],
        // Transition into the largest exponent.
        [0x1FFFFFFFFFE, 0xF7FF],
        [0x1FFFFFFFFFF, 0xF7FF],
        [0x20000000000, 0xF800],
        [0x20000000001, 0xF800],
        [0x2003FFFFFFE, 0xF800],
        [0x2003FFFFFFF, 0xF800],
        [0x20040000000, 0xF801],
        [0x20040000001, 0xF801],
        // Transition into the max value and clamping.
        [0x3FF80000000, 0xFFFE],
        [0x3FFBFFFFFFF, 0xFFFE],
        [0x3FFC0000000, 0xFFFF],
        [0x3FFC0000001, 0xFFFF],
        [0x3FFFFFFFFFF, 0xFFFF],
        [0x40000000000, 0xFFFF],
        [0xFFFFFFFFFFFFFFFF, 0xFFFF]]

      for (const data of testCases) {
        ok(writeUFloat16(Buffer.alloc(2), data[0], 0).equals(uint16Buf(data[1])))
      }
    })

    it('readUFloat16', function () {
      const testCases = [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
        [6, 6],
        [7, 7],
        [15, 15],
        [31, 31],
        [42, 42],
        [123, 123],
        [1234, 1234],
        // Check transition through 2^11.
        [2046, 2046],
        [2047, 2047],
        [2048, 2048],
        [2049, 2049],
        // Running out of mantissa at 2^12.
        [4094, 4094],
        [4095, 4095],
        [4096, 4096],
        [4098, 4097],
        [4100, 4098],
        // Check transition through 2^13.
        [8190, 6143],
        [8192, 6144],
        [8196, 6145],
        // Half-way through the exponents.
        [0x7FF8000, 0x87FF],
        [0x8000000, 0x8800],
        [0xFFF0000, 0x8FFF],
        [0x10000000, 0x9000],
        // Transition into the largest exponent.
        [0x1FFE0000000, 0xF7FF],
        [0x20000000000, 0xF800],
        [0x20040000000, 0xF801],
        // Transition into the max value.
        [0x3FF80000000, 0xFFFE],
        [0x3FFC0000000, 0xFFFF],
      ]

      for (const data of testCases) {
        strictEqual(readUFloat16(uint16Buf(data[1])), data[0])
      }
    })
  })

  suite('UnsafeUInt', function () {
    it('should work', function () {
      let buf = bufferFromBytes([0x1])
      let val = readUnsafeUInt(buf, 0, 1)
      strictEqual(val, 1)
      ok(buf.equals(writeUnsafeUInt(Buffer.allocUnsafe(1), val, 0, 1)))

      buf = bufferFromBytes([0x0, 0x1])
      val = readUnsafeUInt(buf, 0, 2)
      strictEqual(val, 1)
      ok(buf.equals(writeUnsafeUInt(Buffer.allocUnsafe(2), val, 0, 2)))

      buf = bufferFromBytes([0x0, 0x0, 0x1])
      val = readUnsafeUInt(buf, 0, 3)
      strictEqual(val, 1)
      ok(buf.equals(writeUnsafeUInt(Buffer.allocUnsafe(3), val, 0, 3)))

      buf = bufferFromBytes([0x0, 0x0, 0x0, 0x0, 0x0, 0x1])
      val = readUnsafeUInt(buf, 0, 6)
      strictEqual(val, 1)
      ok(buf.equals(writeUnsafeUInt(Buffer.allocUnsafe(6), val, 0, 6)))

      buf = bufferFromBytes([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1])
      val = readUnsafeUInt(buf, 0, 7)
      strictEqual(val, 1)
      ok(buf.equals(writeUnsafeUInt(Buffer.allocUnsafe(7), val, 0, 7)))

      buf = bufferFromBytes([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1])
      val = readUnsafeUInt(buf, 0, 8)
      strictEqual(val, 1)
      ok(buf.equals(writeUnsafeUInt(Buffer.allocUnsafe(8), val, 0, 8)))

      buf = bufferFromBytes([0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1])
      strictEqual(readUnsafeUInt(buf, 1, 6), 1)

      buf = bufferFromBytes([0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1])
      strictEqual(readUnsafeUInt(buf, 1, 7), 1)

      buf = bufferFromBytes([0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1])
      strictEqual(readUnsafeUInt(buf, 1, 8), 1)
    })

    it('should work for Number.MAX_SAFE_INTEGER', function () {
      const val = Number.MAX_SAFE_INTEGER
      let buf = writeUnsafeUInt(Buffer.allocUnsafe(7), val, 0, 7)
      strictEqual(readUnsafeUInt(buf, 0, 7), val)

      buf = writeUnsafeUInt(Buffer.allocUnsafe(8), val, 0, 8)
      strictEqual(readUnsafeUInt(buf, 0, 8), val)

      buf = writeUnsafeUInt(Buffer.allocUnsafe(8), val, 1, 7)
      strictEqual(readUnsafeUInt(buf, 1, 7), val)
    })
  })
})
