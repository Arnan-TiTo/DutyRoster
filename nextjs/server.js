const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

if (process.env.NODE_ENV === 'production') {
    try {
        console.log('Running database migration...')
        require('child_process').execSync('npx prisma db push', { stdio: 'inherit' })
        console.log('Database migration completed.')
    } catch (e) {
        console.error('Migration failed:', e)
    }
}


const port = process.env.PORT || 3000

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true)
        handle(req, res, parsedUrl)
    }).listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })
})
