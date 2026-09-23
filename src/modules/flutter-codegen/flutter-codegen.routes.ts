import { Router } from 'express'
import { generateFlutter } from './flutter-codegen.controller'

const router = Router()

router.post('/flutter', generateFlutter)

export default router
