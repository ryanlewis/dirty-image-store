const fs = require('fs')
const path = require('path')
const contentType = require('content-type')
const mime = require('mime-types')
const getRawBody = require('raw-body')
const micro = require('micro')
const send = micro.send

const images = path.join(__dirname, 'images')

const get = (req, res) => {
  const filename = path.basename(req.url)
  if (typeof filename === 'undefined' || !filename.length) return send(res, 404, 'Not found')

  const file = path.join(images, filename)
  const mimeType = mime.lookup(filename)

  if (!fs.existsSync(file)) return send(res, 404, 'Not found')

  const data = fs.readFileSync(file) 
  res.setHeader('Content-Type', mimeType)
  return send(res, 200, data)
}


const post = async (req, res) => {
  const filename = path.basename(req.url)
  if (typeof filename === 'undefined' || !filename.length) return send(res, 404, 'Not found')

  const data = await getRawBody(req, { 
    length: req.headers['content-length'], limit: '10mb',
    encoding: contentType.parse(req).parameters.charset
  })

  const url = `http://${req.headers['host']}${req.url}`

  fs.writeFileSync(path.join(images, filename), data, { encoding: 'binary' })
  return { url }
}

const server = micro(async (req, res) => {
  if (req.method === 'POST') return await post(req, res)
  return get(req, res)
}) 

server.listen(process.env.port || 3000)