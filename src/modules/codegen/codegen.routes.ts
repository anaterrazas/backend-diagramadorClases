// src/modules/codegen/codegen.routes.ts
import { Router } from 'express'
import { generarSpringBoot } from './codegen.controller'

const router = Router()

// POST /api/codegen/spring-boot — genera un proyecto Spring Boot y devuelve un ZIP.
router.post('/spring-boot', generarSpringBoot)

export default router