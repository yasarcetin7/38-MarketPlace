import app from './app'
import * as os from 'os'
import logger from './common/logger'


// to use env variables
import './common/env'

const PORT = Number(process.env.API_PORT || process.env.PORT || 8000)

app.listen(PORT, () => {
  logger.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port ${PORT}`)
})
