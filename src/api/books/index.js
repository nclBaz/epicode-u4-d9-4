// *********************************************** BOOKS RELATED ENDPOINTS ******************************************

/* ************************************************* BOOKS CRUD ENDPOINTS *******************************************

1. CREATE --> POST http://localhost:3001/books/ (+ body)
2. READ --> GET http://localhost:3001/books/ (+ optional query search params)
3. READ (single book) --> GET http://localhost:3001/books/:bookId
4. UPDATE (single book) --> PUT http://localhost:3001/books/:bookId (+ body)
5. DELETE (single book) --> DELETE http://localhost:3001/books/:bookId

*/

import Express from "express"
import uniqid from "uniqid"
import createHttpError from "http-errors"
import { checkBooksSchema, triggerBadRequest } from "./validation.js"
import { getBooks, writeBooks, getUsers } from "../../lib/fs-tools.js"

const booksRouter = Express.Router()

booksRouter.post("/", checkBooksSchema, triggerBadRequest, async (req, res, next) => {
  const newBook = { ...req.body, id: uniqid(), createdAt: new Date(), updatedAt: new Date() }

  const booksArray = await getBooks()
  booksArray.push(newBook)
  await writeBooks(booksArray)

  res.status(201).send({ id: newBook.id })
})

booksRouter.get("/", async (req, res, next) => {
  try {
    // throw new Error("KABOOOOOOOOOOOOOOOOOOM!")
    const books = await getBooks()
    // const users = await getUsers()
    if (req.query && req.query.category) {
      const filteredBooks = books.filter(book => book.category === req.query.category)
      res.send(filteredBooks)
    } else {
      // res.send({ users, books })
      res.send(books)
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/:bookId", triggerBadRequest, async (req, res, next) => {
  try {
    const booksArray = await getBooks()

    const foundBook = booksArray.find(book => book.id === req.params.bookId)
    if (foundBook) {
      res.send(foundBook)
    } else {
      // the book has not been found, I'd like to trigger a 404 error
      next(createHttpError(404, `Book with id ${req.params.bookId} not found!`)) // this jumps to the error handlers
    }
  } catch (error) {
    next(error) // This error does not have a status code, it should trigger a 500
  }
})

booksRouter.put("/:bookId", async (req, res, next) => {
  try {
    const booksArray = await getBooks()

    const index = booksArray.findIndex(book => book.id === req.params.bookId)
    if (index !== -1) {
      const oldBook = booksArray[index]

      const updatedBook = { ...oldBook, ...req.body, updatedAt: new Date() }

      booksArray[index] = updatedBook

      await writeBooks(booksArray)

      res.send(updatedBook)
    } else {
      next(createHttpError(404, `Book with id ${req.params.bookId} not found!`)) //
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.delete("/:bookId", async (req, res, next) => {
  try {
    const booksArray = await getBooks()

    const remainingBooks = booksArray.filter(book => book.id !== req.params.bookId)

    if (booksArray.length !== remainingBooks.length) {
      await writeBooks(remainingBooks)

      res.status(204).send()
    } else {
      next(createHttpError(404, `Book with id ${req.params.bookId} not found!`)) //
    }
  } catch (error) {
    next(error)
  }
})

export default booksRouter
