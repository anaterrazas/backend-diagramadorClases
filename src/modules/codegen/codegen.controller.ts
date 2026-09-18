// src/modules/codegen/codegen.controller.ts
// Controller del generador local de Spring Boot.
// POST /api/codegen/spring-boot → application/zip

import type { Request, Response } from 'express'
import { validateGenerateRequest, generateSpringBootProject } from './codegen.service'
import { createZipFromFiles } from './zip.service'
import { zipBaseName } from './java-name.utils'

export async function generarSpringBoot(req: Request, res: Response): Promise<void> {
  const validated = validateGenerateRequest(req.body)
  const { files, project } = generateSpringBootProject(validated)
  const buffer = await createZipFromFiles(files)
  const filename = zipBaseName(project.projectName)

  res.status(200)
  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Content-Length', String(buffer.length))
  res.end(buffer)
}