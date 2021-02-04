const config = require('../config.json')

const restana = require('restana')
const http    = restana()
const fetch   = require('node-fetch')
const cors    = require('cors')

const bodyParser = require('body-parser')

http.use(bodyParser.text())
http.use(cors())

http.post('/url', async (req, res) => {
  let { body: url } = req
  let host

  if (typeof url !== 'string') url = ''
  url = url?.toLowerCase()

  if (!url.startsWith('growtopia1.com') && !url.startsWith('growtopia2.com'))
    host = ''
  else host = url

  if (!url.startsWith('http://') && !url.startsWith('https://'))
    url = `http://${url}`

  url += '/growtopia/server_data.php'

  try {
    const r = await fetch(
      url,
      {
        method: 'POST',
        body: ' '.repeat(38),
        timeout: 3000,
        headers: {
          accept: '*/*',
          'content-type': 'application/x-www-form-urlencoded',
          host
        },
      }
    )

    const textData = (await r.text()).trim()
    res.send(textData)
  } catch(err) { res.send({ err: true, msg: err.message }) }
})

http.start(config.cors.port, '0.0.0.0')
.then(() => console.log('Cors server started at', config.cors.port))