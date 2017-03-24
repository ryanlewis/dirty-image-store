const fs = require('fs')
const path = require('path')
const url = require('url')
const contentType = require('content-type')
const mime = require('mime-types')
const getRawBody = require('raw-body')
const micro = require('micro')
const send = micro.send

const images = path.join(__dirname, 'images')

const getFilenameFromRequest = (req) => {
  const parsedUrl = url.parse(req.url)
  if (typeof parsedUrl === 'undefined') return send(res, 404, 'Bad request')

  const filename = path.basename(parsedUrl.pathname)
  if (typeof filename === 'undefined' || !filename.length) return send(res, 400, 'Bad filename')

  return filename
}

const get = (req, res) => {
  const filename = getFilenameFromRequest(req)

  const file = path.join(images, filename)
  const mimeType = mime.lookup(filename)

  if (!fs.existsSync(file)) return send(res, 404, 'Not found')

  const data = fs.readFileSync(file) 
  res.setHeader('Content-Type', mimeType)
  return send(res, 200, data)
}

const post = async (req, res) => {
  const filename = getFilenameFromRequest(req)

  const data = await getRawBody(req, { 
    length: req.headers['content-length'], limit: '10mb',
    encoding: contentType.parse(req).parameters.charset
  })

  const imageUrl = `http://${req.headers['host']}/${filename}`

  fs.writeFileSync(path.join(images, filename), data, { encoding: 'binary' })
  return { imageUrl }
}

const server = micro(async (req, res) => {
  if (req.method === 'POST') return await post(req, res)
  return get(req, res)
}) 

const port = process.env.port || 3000
server.listen(port)
console.log(`Listening on ${port}`)