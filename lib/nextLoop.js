function nextLoop () {
  return new Promise(resolve => setTimeout(resolve, 0))
}

module.exports = nextLoop
