# readable-to-readable

ReadableToReadable forwards the data of one Readable to another Readable.
This can be useful if a Readable must be wrapped into another Readable.

## Usage

The package returns a class.
The constructor must be called with the input streams as the first parameter and the output stream as the second parameter.
To forward the chunks, the `.forward()` method must be called.
A good place to call the `.forward()` method, is the `._read()` method of the output stream.

### Methods

- `async forward()`: Forwards chunks until no more chunks are available or the high water mark of the output stream is reached.
- `async destroy()`: Forwards the remaining chunks and closes the output stream after that.

### Properties

- `destroyed`: True once the destroy method was called.
- `end`: True once the `end` event was emitted.

## Example

Two streams are created in this example.
Data is pushed to the `input` stream and read from the `output` stream.
The `output` stream handles the forwarding.
Once the data passed the two streams, it's written to the console.
This is done till the `end` event was emitted.

```
const { Readable } = require('readable-stream')
const ReadableToReadable = require('readable-to-readable')

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
```
