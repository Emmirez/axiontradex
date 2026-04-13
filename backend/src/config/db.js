import mongoose from 'mongoose'
import logger from './logger.js'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
      connectTimeoutMS:         30000,
      maxPoolSize:              50,  
      minPoolSize:              10, 
      retryWrites:              true,
    })
    logger.info(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`)
    throw err
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected — attempting reconnect...')
  setTimeout(() => {
    mongoose.connect(process.env.MONGO_URI).catch(err =>
      logger.error(`Reconnect failed: ${err.message}`)
    )
  }, 5000)
})

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected')
})

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`)
})

export default connectDB