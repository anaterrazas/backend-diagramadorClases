import type { Request, Response } from 'express'
import { generateFlutterZip } from './flutter-codegen.service'

export async function generateFlutter(req: Request, res: Response): Promise<void> {
  const buffer = await generateFlutterZip(req.body)

  res.status(200)
  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', 'attachment; filename="flutter-app.zip"')
  res.setHeader('Content-Length', String(buffer.length))
  res.end(buffer)
}
