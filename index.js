const nextLoop = require('./lib/nextLoop')

class ReadableToReadable {
  constructor (input, output) {
    this.input = input
    this.output = output

    this.destroyed = false
    this.end = false // end event was emitted

    this.input.once('end', () => this.destroy())
  }

  /**
   * Forwards chunks until ReadableToReadable gets destroyed or the output stream doesn't accept more chunks.
   * Returns true if all currently available chunks were processed.
   * Returns false if the output stream doesn't accept more chunks.
   * @returns {Promise<boolean>}
   */
  async forward () {
    do {
      const chunk = this.input.read()

      if (!chunk) {
        await nextLoop()

        continue
      }

      if (!this.output.push(chunk)) {
        return false
      }
    } while (!this.destroyed)

    return true
  }

  /**
   * Destroys the ReadableToReadable and closes the output stream.
   * Remaining chunks are processed before the stream is closed.
   * @returns {Promise<void>}
   */
  async destroy () {
    this.destroyed = true

    // read any remaining chunks...
    while (!await this.forward()) {
      await nextLoop()
    }

    // ...before closing the stream
    this.output.push(null)

    this.end = true
  }
}

module.exports = ReadableToReadable
