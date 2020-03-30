const { strictEqual } = require('assert')
const getStream = require('get-stream')
const { describe, it } = require('mocha')
const { Readable } = require('readable-stream')
const ReadableToReadable = require('..')

describe('ReadableToReadable', () => {
  it('should be a constructor', () => {
    strictEqual(typeof ReadableToReadable, 'function')
  })

  it('should trigger end if input emits end', async () => {
    let end = false
    const input = new Readable({ read: () => {} })
    const output = new ReadableToReadable(input)

    output.once('end', () => {
      end = true
    })

    input.push(null)

    await getStream(output)

    strictEqual(end, true)
  })

  it('should forward the chunks of input', async () => {
    const input = new Readable({ read: () => {} })
    const output = new ReadableToReadable(input)

    input.push('a')
    input.push('b')
    input.push('c')
    input.push(null)

    const chunks = await getStream(output)

    strictEqual(chunks.toString(), 'abc')
  })

  it('should set the high water mark if given', async () => {
    const input = new Readable({ read: () => {} })
    const output = new ReadableToReadable(input, { highWaterMark: 2 })

    strictEqual(output._readableState.highWaterMark, 2)
  })

  it('should work in object mode if given', async () => {
    const chunks = []
    const input = new Readable({ objectMode: true, read: () => {} })
    const output = new ReadableToReadable(input, { objectMode: true })

    input.push('a')
    input.push('bc')
    input.push(null)

    output.on('data', chunk => {
      chunks.push(chunk)
    })

    await getStream(output)

    strictEqual(chunks.length, 2)
    strictEqual(chunks[0], 'a')
    strictEqual(chunks[1], 'bc')
  })

  it('should use the given map function to translate the chunks', async () => {
    const input = new Readable({ read: () => {} })
    const output = new ReadableToReadable(input, { map: v => v.toString().toUpperCase() })

    input.push('a')
    input.push('b')
    input.push('c')
    input.push(null)

    const chunks = await getStream(output)

    strictEqual(chunks, 'ABC')
  })

  describe('readFrom', () => {
    it('should be a function', () => {
      strictEqual(typeof ReadableToReadable.readFrom, 'function')
    })

    it('should trigger end if input emits end', async () => {
      let end = false
      const input = new Readable({ read: () => {} })
      const output = new Readable({ read: ReadableToReadable.readFrom(input) })

      output.once('end', () => {
        end = true
      })

      input.push(null)

      await getStream(output)

      strictEqual(end, true)
    })

    it('should forward the chunks of input', async () => {
      const input = new Readable({ read: () => {} })
      const output = new Readable({ read: ReadableToReadable.readFrom(input) })

      input.push('a')
      input.push('b')
      input.push('c')
      input.push(null)

      const chunks = await getStream(output)

      strictEqual(chunks.toString(), 'abc')
    })

    it('should use the given map function to translate the chunks', async () => {
      const input = new Readable({ read: () => {} })
      const output = new Readable({
        read: ReadableToReadable.readFrom(input, {
          map: v => v.toString().toUpperCase()
        })
      })

      input.push('a')
      input.push('b')
      input.push('c')
      input.push(null)

      const chunks = await getStream(output)

      strictEqual(chunks, 'ABC')
    })
  })
})
