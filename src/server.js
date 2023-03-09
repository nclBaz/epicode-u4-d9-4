// const express = require("express") OLD IMPORT SYNTAX
import Express from "express" // NEW IMPORT SYNTAX (We can use it only if we add "type": "module", to package.json)
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import { join } from "path"
import usersRouter from "./api/users/index.js"
import booksRouter from "./api/books/index.js"
import filesRouter from "./api/files/index.js"
import { genericErrorHandler, badRequestHandler, unauthorizedHandler, notfoundHandler } from "./errorsHandlers.js"
import createHttpError from "http-errors"

const server = Express()
const port = process.env.PORT || 3001
const publicFolderPath = join(process.cwd(), "./public")

console.log(process.env.MONGO_URL)
console.log(process.env.SECRET)

// ************************** GLOBAL MIDDLEWARES *********************

// ********************************************* CORS ************************************************

// CORS = CROSS-ORIGIN RESOURCE SHARING

/* Cross-Origin requests:

1. FE=http://localhost:3000 and BE=http://localhost:3001 <-- 2 different port numbers they represent 2 different origins
2. FE=https://myfe.com and BE=https://mybe.com <-- 2 different domains they represent 2 different origins
3. FE=https://mydomain.com and BE=http://mydomain.com <-- 2 different protocols they represent 2 different origins

*/

// ***************************************************************************************************

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

server.use(Express.static(publicFolderPath))
server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        // origin is in the whitelist
        corsNext(null, true)
      } else {
        // origin is not in the whitelist
        corsNext(createHttpError(400, `Origin ${currentOrigin} is not in the whitelist!`))
      }
    },
  })
)
server.use(Express.json()) // If you don't add this line BEFORE the endpoints all request bodies will be UNDEFINED!!!!!!!!!!!!!!!

// ************************** ENDPOINTS ***********************
server.use("/users", usersRouter)
server.use("/books", booksRouter)
server.use("/files", filesRouter)

// ************************* ERROR HANDLERS *******************
server.use(badRequestHandler) // 400
server.use(unauthorizedHandler) // 401
server.use(notfoundHandler) // 404
server.use(genericErrorHandler) // 500 (this should ALWAYS be the last one)

// mongo.connect(process.env.MONGO_URL)

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log(`Server is running on port ${port}`)
})
