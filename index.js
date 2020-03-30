const { finished, Readable } = require('readable-stream')

function nextLoop () {
  return new Promise(resolve => setTimeout(resolve, 0))
}

class ReadableToReadable extends Readable {
  constructor (input, { map, ...args } = {}) {
    super({
      read: ReadableToReadable.readFrom(input, { map }),
      ...args
    })
  }

  static readFrom (input, { map = v => v } = {}) {
    let done = false

    finished(input, () => {
      done = true
    })

    const read = async function () {
      const chunk = input.read()

      if (!chunk) {
        if (done) {
          return this.push(null)
        }

        await nextLoop()
      } else {
        if (!this.push(map(chunk))) {
          return
        }
      }

      read.call(this)
    }

    return read
  }
}

module.exports = ReadableToReadable
