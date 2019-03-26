/* global describe, expect, test */

const nextLoop = require('../lib/nextLoop')
const ReadableToReadable = require('..')
const { Readable } = require('readable-stream')

describe('ReadableToReadable', () => {
  test('module returns a constructor', () => {
    expect(typeof ReadableToReadable).toBe('function')
  })

  test('input and output arguments are assigned to the object', () => {
    const input = new Readable({ read: () => {} })
    const output = new Readable({ read: () => {} })

    const readableToReadable = new ReadableToReadable(input, output)

    expect(readableToReadable.input).toBe(input)
    expect(readableToReadable.output).toBe(output)
  })

  test('is not destroyed in initial state', () => {
    const input = new Readable({ read: () => {} })
    const output = new Readable({ read: () => {} })

    const readableToReadable = new ReadableToReadable(input, output)

    expect(readableToReadable.destroyed).toBe(false)
  })

  test('end of input triggers end of output', async () => {
    let end = false
    const input = new Readable({ read: () => {} })
    const output = new Readable({ read: () => {} })
    const readableToReadable = new ReadableToReadable(input, output)

    output.once('end', () => { end = true })
    output.resume()

    input.push(null)

    do {
      await readableToReadable.forward()
      await nextLoop()
    } while (!end) // eslint-disable-line no-unmodified-loop-condition
  })

  test('destroyed is true at end of input', async () => {
    const input = new Readable({ read: () => {} })
    const output = new Readable({ read: () => {} })
    const readableToReadable = new ReadableToReadable(input, output)

    output.resume()

    input.push(null)

    do {
      await readableToReadable.forward()
      await nextLoop()
    } while (!readableToReadable.destroyed)
  })

  test('end is true after end event was emitted', async () => {
    const input = new Readable({ read: () => {} })
    const output = new Readable({ read: () => {} })
    const readableToReadable = new ReadableToReadable(input, output)

    output.resume()

    input.push(null)

    do {
      await readableToReadable.forward()
      await nextLoop()
    } while (!readableToReadable.end)
  })

  test('data event of output emits chunks of input', async () => {
    const chunks = []
    const input = new Readable({ read: () => {} })
    const output = new Readable({ read: () => {} })
    const readableToReadable = new ReadableToReadable(input, output)

    input.push('a')
    input.push('b')
    input.push('c')
    input.push(null)

    output.on('data', chunk => chunks.push(chunk))

    do {
      await readableToReadable.forward()
      await nextLoop()
    } while (!readableToReadable.end)

    expect(Buffer.concat(chunks).toString()).toBe('abc')
  })

  test('output emits chunks of input if chunks are added async', async () => {
    const chunks = []
    const input = new Readable({ read: () => {} })
    const output = new Readable({ read: () => {} })
    const readableToReadable = new ReadableToReadable(input, output)

    setTimeout(() => {
      input.push('a')
      input.push('b')
      input.push('c')
      input.push(null)
    }, 10)

    output.on('data', chunk => chunks.push(chunk))

    do {
      await readableToReadable.forward()
      await nextLoop()
    } while (!readableToReadable.end)

    expect(Buffer.concat(chunks).toString()).toBe('abc')
  })

  test('should handle high water mark', async () => {
    const expectedChunks = []
    const chunks = []
    const input = new Readable({ read: () => {} })
    const output = new Readable({ read: () => {}, highWaterMark: 2 })
    const readableToReadable = new ReadableToReadable(input, output)

    for (let i = 0; i < 1000; i++) {
      expectedChunks.push(i.toString())

      input.push(i.toString())
    }

    input.push(null)

    output.on('data', chunk => chunks.push(chunk))

    do {
      await readableToReadable.forward()
      await nextLoop()
    } while (!readableToReadable.end)

    expect(Buffer.concat(chunks).toString()).toBe(expectedChunks.join(''))
  })
})
