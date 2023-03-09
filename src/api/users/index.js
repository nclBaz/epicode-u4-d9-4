// *********************************************** USERS RELATED ENDPOINTS ******************************************

/* ************************************************* USERS CRUD ENDPOINTS *******************************************

1. CREATE --> POST http://localhost:3001/users/ (+ body)
2. READ --> GET http://localhost:3001/users/ (+ optional query search params)
3. READ (single user) --> GET http://localhost:3001/users/:userId
4. UPDATE (single user) --> PUT http://localhost:3001/users/:userId (+ body)
5. DELETE (single user) --> DELETE http://localhost:3001/users/:userId

*/

import Express from "express" // 3RD PARTY MODULE (npm i express)
import fs from "fs" // CORE MODULE (no need to install it!!!!)
import { fileURLToPath } from "url" // CORE MODULE
import { dirname, join } from "path" // CORE MODULE
import uniqid from "uniqid"
import { getUsers } from "../../lib/fs-tools.js"

const usersRouter = Express.Router() // an Express Router is a set of similar endpoints grouped in the same collection

// ******************** HOW TO GET USERS.JSON PATH **********************

// target --> F:\Work\Epicode\2022\EN\BE-Master-04\U4\epicode-u4-d2-4\src\api\users\users.json

// 1. We gonna start from the current's file path F:\Work\Epicode\2022\EN\BE-Master-04\U4\epicode-u4-d2-4\src\api\users\index.js
// console.log("CURRENT FILE URL:", import.meta.url)
// console.log("CURRENT FILE PATH:", fileURLToPath(import.meta.url))
// // 2. We can then obtain the parent's folder path F:\Work\Epicode\2022\EN\BE-Master-04\U4\epicode-u4-d2-4\src\api\users\
// console.log("PARENT'S FOLDER PATH:", dirname(fileURLToPath(import.meta.url)))
// // 3. Finally we can concatenate parent's folder path with "users.json" --> F:\Work\Epicode\2022\EN\BE-Master-04\U4\epicode-u4-d2-4\src\api\users\users.json
// console.log("TARGET:", join(dirname(fileURLToPath(import.meta.url)), "users.json")) // WHEN YOU CONCATENATE TWO PATHS TOGETHER USE JOIN!!! (not the '+' symbol)

const usersJSONPath = join(dirname(fileURLToPath(import.meta.url)), "users.json")
console.log("TARGET:", join(dirname(fileURLToPath(import.meta.url)), "users.json"))
// ***********************************************************************

// 1.
usersRouter.post("/", (req, res) => {
  // 1. Read the request body
  // console.log("REQUEST BODY:", req.body) // DO NOT FORGET TO ADD EXPRESS.JSON INTO SERVER.JS!!!!!!!!!!!!!!!!
  // 2. Add some server generated info (unique id, createdAt, ...)
  const newUser = { ...req.body, createdAt: new Date(), updatedAt: new Date(), id: uniqid() }

  // 3. Save new user into users.json file

  // 3.1 Read the content of the file, obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath))

  // 3.2 Add the new user to the array
  usersArray.push(newUser)

  // 3.3 Write the array back to the file
  fs.writeFileSync(usersJSONPath, JSON.stringify(usersArray)) // we cannot pass an array here, it needs to be converted into a string

  // 4. Send back a proper response
  res.status(201).send({ id: newUser.id })
})

// 2.
usersRouter.get("/", (req, res) => {
  // 1. Read the content of users.json file
  const fileContentAsBuffer = fs.readFileSync(usersJSONPath) // This is going to give us back a BUFFER object, which is a MACHINE READABLE FORMAT
  //console.log("FILE CONTENT:", fileContentAsBuffer)

  // 2. We shall convert the buffer into an array
  //console.log("FILE CONTENT AS ARRAY:", JSON.parse(fileContentAsBuffer))
  const usersArray = JSON.parse(fileContentAsBuffer)

  // 3. Send the array of users back as response
  res.send(usersArray)
})

// 3.
usersRouter.get("/:userId", (req, res) => {
  // 1. Extract the userId from the URL
  //console.log("USER ID:", req.params.userId)

  // 2. Read users.json file --> obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath))

  // 3. Search for the specified user into the array
  const user = usersArray.find(user => user.id === req.params.userId)

  // 4. Send the found user as a response
  res.send(user)
})

// 4.
usersRouter.put("/:userId", (req, res) => {
  // 1. Read the file obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath))

  // 2. Modify the specified user by merging previous properties with the properties coming from req.body
  const index = usersArray.findIndex(user => user.id === req.params.userId)
  const oldUser = usersArray[index]
  const updatedUser = { ...oldUser, ...req.body, updatedAt: new Date() }
  usersArray[index] = updatedUser

  // 3. Save the modified array back to disk
  fs.writeFileSync(usersJSONPath, JSON.stringify(usersArray))

  // 4. Send back a proper response
  res.send(updatedUser)
})

// 5.
usersRouter.delete("/:userId", (req, res) => {
  // 1. Read the file obtaining an array
  const usersArray = JSON.parse(fs.readFileSync(usersJSONPath))

  // 2. Filter out the specified user from the array, keep just the remaining users
  const remainingUsers = usersArray.filter(user => user.id !== req.params.userId) // ! = =

  // 3. Save the array of remaining users back to the file
  fs.writeFileSync(usersJSONPath, JSON.stringify(remainingUsers))

  // 4. Send back a proper response
  res.status(204).send()
})

export default usersRouter // DO NOT FORGET TO EXPORT THIS!!!
