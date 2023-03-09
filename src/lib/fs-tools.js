import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { createWriteStream } from "fs"

const { readJSON, writeJSON, writeFile, createReadStream } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data") // D:\Work\Epicode\2022\EN\BE-Master-04\U4\epicode-u4-d4-4\src\data
const usersJSONPath = join(dataFolderPath, "users.json")
const booksJSONPath = join(dataFolderPath, "books.json")
const usersPublicFolderPath = join(process.cwd(), "./public/img/users")

export const getUsers = () => readJSON(usersJSONPath)
export const writeUsers = usersArray => writeJSON(usersJSONPath, usersArray)
export const getBooks = () => readJSON(booksJSONPath)
export const writeBooks = booksArray => writeJSON(booksJSONPath, booksArray)

export const saveUsersAvatars = (fileName, fileContentAsBuffer) => writeFile(join(usersPublicFolderPath, fileName), fileContentAsBuffer)

export const getBooksJSONReadableStream = () => createReadStream(booksJSONPath)
export const getPDFWritableStream = filename => createWriteStream(join(dataFolderPath, filename))
