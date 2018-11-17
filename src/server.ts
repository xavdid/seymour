import * as express from 'express'
import { listener } from './index'
import * as helmet from 'helmet'

const app = express()
app.use(helmet)

const port = process.env.PORT || 3000

app.get('/', (req, res) => res.send('Hello!'))

app.listen(port, () => console.log(`Server running on :${port}`))

// const server = createServer(listener).on('listening', () => {
//   console.log(`Server running at http://${hostname}:${port}/`)
// })

// export const start = () =>
//   new Promise((resolve, reject) => {
//     server.listen(port, hostname, resolve).on('error', reject)
//   })

// export const stop = () =>
//   new Promise(resolve => {
//     server.close(resolve)
//   })

// export const isRunning = () => server.listening

// if (require.main === module) {
//   start().catch(err => console.error(err.message))
// }

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})
// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  // render the error page
  res.status(err.status || 500)
  res.render('error')
})
