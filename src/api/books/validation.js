import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const booksSchema = {
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string!",
    },
  },
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },
  // email: {
  //   in: ["body"],
  //   isEmail: {
  //     errorMessage: "Email is a mandatory field and needs to be a valid email address!",
  //   },
  // },
}

export const checkBooksSchema = checkSchema(booksSchema) // this function creates a middleware

export const triggerBadRequest = (req, res, next) => {
  // 1. Check if checkBooksSchema has found any error in req.body
  const errors = validationResult(req)

  console.log(errors.array())

  if (errors.isEmpty()) {
    // 2.1 If we don't have errors --> normal flow (next)
    next()
  } else {
    // 2.2 If we have any error --> trigger 400
    next(createHttpError(400, "Errors during book validation", { errorsList: errors.array() }))
  }
}
