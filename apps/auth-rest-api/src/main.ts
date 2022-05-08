import app from './app/app'
import { APP_PORT } from './constants'

// Listen
const port = APP_PORT

app.listen(port, () => {
  console.log(`🚀 @smart-tickets/auth-api server ready at http://localhost:${port}/auth`)
})
