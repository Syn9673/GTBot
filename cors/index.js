const config = require('../config.json')

const restana = require('restana')
const http    = restana()
const fetch   = require('node-fetch')

const bodyParser = require('body-parser')
http.use(bodyParser.text())

http.post('/url', async (req, res) => {
  let { body: url } = req
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (!url.startsWith('http://') && !url.startsWith('https://'))
    url = `http://${url}`

  url += '/growtopia/server_data.php'

  try {
    const r = await fetch(
      url,
      {
        method: 'POST',
        body: ' '.repeat(38),
        headers: {
          accept: '*/*',
          'content-type': 'application/x-www-form-urlencoded',
          host: 'growtopia1.com'
        },
      }
    )

    const textData = (await r.text()).trim()
    res.send(textData)
  } catch(err) { res.send({ err: true, msg: err.message }) }
})

http.start(config.cors.port)
.then(() => console.log('Cors server started at', config.cors.port))