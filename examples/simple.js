const { Readable } = require('readable-stream')
const ReadableToReadable = require('..')

async function main () {
  // just a plain Readable to push some data
  const input = Readable({
    read: () => {}
  })

  // in the output stream we forward the data from input whenever .read is called
  const output = Readable({
    read: () => {
      readableToReadable.forward()
    }
  })

  // connect the streams
  const readableToReadable = new ReadableToReadable(input, output)

  // add some data and close the stream
  input.push('a')
  input.push('b')
  input.push('c')
  input.push(null)

  // write each chunk to the console
  output.on('data', chunk => console.log(chunk.toString()))

  // wait till the end event of output was emitted
  await (new Promise(resolve => output.once('end', resolve)))
}

main()
