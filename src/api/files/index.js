import Express from "express"
import multer from "multer"
import { extname } from "path"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { pipeline } from "stream"
import { createGzip } from "zlib"
import { getBooks, getBooksJSONReadableStream, saveUsersAvatars } from "../../lib/fs-tools.js"
import { getPDFReadableStream } from "../../lib/pdf-tools.js"

const filesRouter = Express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // cloudinary is going to search for smth in .env vars called process.env.CLOUDINARY_URL
    params: {
      folder: "fs0522/users",
    },
  }),
}).single("avatar")

filesRouter.post("/:userId/single", cloudinaryUploader, async (req, res, next) => {
  // "avatar" here needs to match exactly to the name of the field appended to the FormData object in the FE (or in Postman req body)
  // If they do not match, multer will not find any file
  try {
    console.log("FILE:", req.file)
    // console.log("BODY:", req.body)
    // const originalFileExtension = extname(req.file.originalname)
    // const fileName = req.params.userId + originalFileExtension
    // await saveUsersAvatars(fileName, req.file.buffer)

    // Add an avatar field to the corresponding user in users.json file, containing `https://res.cloudinary.com/riccardostrive/image/upload/v1678103158/fs0522/users/ufh2uwhbani8ttvho9zl.gif`

    res.send({ message: "file uploaded" })
  } catch (error) {
    next(error)
  }
})

filesRouter.post("/:userId/multiple", multer().array("avatars"), async (req, res, next) => {
  try {
    await Promise.all(req.files.map(file => saveUsersAvatars(file.originalname, file.buffer)))
    console.log("REQ FILES:", req.files)
    res.send({ message: "files uploaded" })
  } catch (error) {
    next(error)
  }
})

filesRouter.get("/booksJSON", (req, res, next) => {
  try {
    // SOURCES (file on disk, http request,...) --> DESTINATIONS (file on disk, terminal, http response, ...)
    res.setHeader("Content-Disposition", "attachment; filename=books.json.gz") // Without this header the browser will try to open (not save) the file.
    // This header will tell the browser to open the "save file as" dialog
    // SOURCE (READABLE STREAM on books.json file) --> DESTINATION (WRITABLE STREAM http response)
    const source = getBooksJSONReadableStream()
    const destination = res
    const transform = createGzip()

    pipeline(source, transform, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})

filesRouter.get("/pdf", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=example.pdf") // Without this header the browser will try to open (not save) the file.
    // This header will tell the browser to open the "save file as" dialog
    // SOURCE (READABLE STREAM pdfmake) --> DESTINATION (WRITABLE STREAM http response)
    const books = await getBooks()
    const source = getPDFReadableStream(books[0])
    const destination = res

    pipeline(source, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})

export default filesRouter
