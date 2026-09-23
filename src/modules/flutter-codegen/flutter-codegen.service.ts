import { createZipFromFiles } from '../codegen/zip.service'
import { validateFlutterCodegenRequest } from './flutter-codegen.validator'
import { buildFlutterProject } from './flutter-codegen.model'
import type { FlutterFile, FlutterProject } from './flutter-codegen.types'
import { generateApiClientFile } from './generators/api-client.generator'
import { generateAppProvidersFile } from './generators/app-providers.generator'
import { generateMainFile } from './generators/main.generator'
import { generateModelFiles } from './generators/model.generator'
import { generateServiceFiles } from './generators/service.generator'
import { generateProviderFiles } from './generators/provider.generator'
import { generateListPageFiles } from './generators/list-page.generator'
import { generateCreatePageFiles } from './generators/create-page.generator'
import { generateEditPageFiles } from './generators/edit-page.generator'

export function generateFlutterProject(body: unknown): FlutterProject {
  const request = validateFlutterCodegenRequest(body)
  const project = buildFlutterProject(request)
  const files = generateFiles(project)
  project.files = files
  return project
}

export async function generateFlutterZip(body: unknown): Promise<Buffer> {
  const project = generateFlutterProject(body)
  const files = Object.fromEntries(project.files.map((file) => [file.path, file.content]))
  return createZipFromFiles(files)
}

function generateFiles(project: FlutterProject): FlutterFile[] {
  return [
    generateApiClientFile(project),
    generateAppProvidersFile(project),
    ...generateModelFiles(project),
    ...generateServiceFiles(project),
    ...generateProviderFiles(project),
    ...generateListPageFiles(project),
    ...generateCreatePageFiles(project),
    ...generateEditPageFiles(project),
    generateMainFile(project),
  ]
}
