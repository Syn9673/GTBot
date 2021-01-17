const { rmSync } = require('fs')

rmSync(`${process.cwd()}/proxy/src/out`, { recursive: true, force: true })