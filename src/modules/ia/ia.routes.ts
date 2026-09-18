// src/modules/ia/ia.routes.ts
import { Router } from 'express'
import {
  generarTextoHandler,
  generarDesdeImagenHandler
} from './ia.controller'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({ storage })
const router = Router()

router.post('/texto', generarTextoHandler)
router.post('/imagen', upload.single('imagen'), generarDesdeImagenHandler)

export default router
