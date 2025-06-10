const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server for Next.js
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Start Next.js server
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Next.js ready on http://${hostname}:${port}`)
    console.log(`> WebSocket functionality available through API routes`)
  })

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log('Received shutdown signal, closing server...')

    server.close(() => {
      console.log('Next.js server closed')
      process.exit(0)
    })
  }

  process.on('SIGTERM', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
})
