// backend/src/server.js
import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'
import connectDB from './config/db.js'
import logger from './config/logger.js'
import { startMarketPolling } from './routes/marketRoutes.js'

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
  })
   
  startMarketPolling()
  // ── Graceful shutdown — closes MongoDB connections on nodemon restart 
  // Without this, every nodemon restart leaks connections until M0 pool exhausts
  const shutdown = async (signal) => {
    logger.info(`${signal} received — closing server and MongoDB connection...`)
    server.close(async () => {
      await mongoose.connection.close()
      logger.info('MongoDB connection closed cleanly')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))   // Ctrl+C / nodemon restart

}).catch(err => {
  logger.error('Failed to connect to MongoDB', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err)
  process.exit(1)
})