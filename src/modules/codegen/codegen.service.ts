// src/modules/codegen/codegen.service.ts
// Orquestador del generador local de Spring Boot.
//
// Flujo: JSON v2 → modelo intermedio Java → archivos del proyecto → ZIP.
// El JSON v2 se consume tal cual (contrato del editor); nunca se modifica.

import { HttpError } from '../../utils/http-error'
import type {
  DiagramV2,
  GenerateSpringBootRequest,
  JavaClass,
  JavaField,
  JavaProject,
  UmlAttributeV2,
  ValidatedGenerateRequest,
} from './types'
import {
  applicationClassNameFromProject,
  basePackageFromProject,
  sanitizeClassName,
  sanitizeFieldName,
  sanitizeFolderName,
} from './java-name.utils'
import { appGenerator } from './app.generator'
import { pomGenerator } from './pom.generator'
import { entityGenerator } from './entity.generator'
import { repositoryGenerator } from './repository.generator'
import { serviceGenerator } from './service.generator'
import { controllerGenerator } from './controller.generator'
import { dtoGenerator } from './dto.generator'

/**
 * Mapeo de tipos UML → tipos Java.
 *
 * Tipos UML con los que trabaja el editor:
 * int,bigint,float,double,decimal,string,text,bool,date,time,datetime,uuid,json.
 *
 * Estrategia segura para tipos desconocidos: se mapean a `String` y el
 * comportamiento queda documentado en esta tabla (el proyecto resultante
 * siempre es código Java válido).
 */
const TYPE_MAP: Record<string, string> = {
  string: 'String',
  text: 'String',
  char: 'String',
  json: 'String',
  uuid: 'UUID',
  int: 'Integer',
  integer: 'Integer',
  short: 'Short',
  byte: 'Byte',
  long: 'Long',
  bigint: 'Long',
  float: 'Float',
  double: 'Double',
  decimal: 'BigDecimal',
  number: 'BigDecimal',
  boolean: 'Boolean',
  bool: 'Boolean',
  date: 'LocalDate',
  time: 'LocalTime',
  datetime: 'LocalDateTime',
  timestamp: 'LocalDateTime',
}

export function mapJavaType(type: string | undefined): string {
  const t = (type ?? '').trim().toLowerCase()
  return TYPE_MAP[t] ?? 'String'
}

function isNumericBoundJavaType(javaType: string): boolean {
  return Boolean(javaType) && ['Long', 'Integer', 'Short', 'Byte', 'Float', 'Double', 'BigDecimal'].includes(javaType)
}

/**
 * Valida el cuerpo del request. Errores simples de entrada → HttpError(400),
 * que el error-handler global convierte en JSON (sin HTML ni stack).
 */
export function validateGenerateRequest(body: unknown): ValidatedGenerateRequest {
  if (!body || typeof body !== 'object') {
    throw new HttpError('El cuerpo de la petición debe ser un objeto JSON', 400)
  }
  const { projectName, includeDto, diagram } = body as GenerateSpringBootRequest

  if (!diagram || typeof diagram !== 'object' || typeof (diagram as DiagramV2).classes !== 'object') {
    throw new HttpError('El campo "diagram" es obligatorio y debe contener "classes"', 400)
  }

  return {
    projectName: typeof projectName === 'string' && projectName.trim() ? projectName.trim() : 'demo-sources',
    includeDto: includeDto !== false,
    diagram: diagram as DiagramV2,
  }
}

/** Construye el modelo intermedio Java a partir del diagrama v2. */
function buildJavaClasses(diagram: DiagramV2): JavaClass[] {
  const rawClasses = Object.values(diagram.classes ?? {})
  const classNameById = new Map<string, string>()
  for (const c of rawClasses) {
    if (c?.id) classNameById.set(c.id, sanitizeClassName(c?.name))
  }

  // Generalization: sourceId = subclase (specific), targetId = superclase (general).
  const parentByChild = new Map<string, string>()
  const parentsWithSubclasses = new Set<string>()
  for (const l of Object.values(diagram.links ?? {})) {
    const kind = (l?.kind ?? '').toLowerCase()
    if (kind !== 'generalize') continue
    const child = classNameById.get(l.sourceId)
    const parent = classNameById.get(l.targetId)
    if (child && parent && child !== parent) {
      parentByChild.set(child, parent)
      parentsWithSubclasses.add(parent)
    }
  }

  return rawClasses.map((c) => {
    const className = sanitizeClassName(c?.name)
    return {
      className,
      tableName: className.toLowerCase(),
      fields: buildFields(c?.attributes ?? []),
      parentClassName: parentByChild.get(className),
      isParentWithSubclasses: parentsWithSubclasses.has(className),
    }
  })
}

/**
 * Construye los campos Java de la clase.
 *
 * Decisión de ID (solo interna al CodeGen, el UML nunca se modifica):
 * - Si la clase tiene un atributo llamado "id" (case-insensitive), se usa como
 *   @Id. Si además su tipo mapeado es numérico se marca @GeneratedValue(IDENTITY).
 * - Si no lo tiene, se sintetiza "private Long id" con @GeneratedValue(IDENTITY).
 */
function buildFields(attributes: UmlAttributeV2[]): JavaField[] {
  const fields: JavaField[] = []
  let hasExplicitId = false

  for (const a of attributes ?? []) {
    // Corta el símbolo de visibilidad si quedó pegado al nombre (defensivo).
    const rawName = (a?.name ?? '').trim().replace(/^[+\-#~]\s*/, '')
    if (!rawName) continue

    const javaType = mapJavaType(a?.type)
    const isId = rawName.toLowerCase() === 'id'
    const autoGeneratedId = isId && isNumericBoundJavaType(javaType)

    if (isId) hasExplicitId = true
    fields.push({
      name: sanitizeFieldName(rawName),
      javaType,
      isId,
      autoGeneratedId,
    })
  }

  if (!hasExplicitId) {
    fields.unshift({ name: 'id', javaType: 'Long', isId: true, autoGeneratedId: true })
  }

  return fields
}

function applicationPropertiesFile(project: JavaProject): string {
  return [
    `spring.application.name=${project.slug}`,
    `spring.datasource.url=jdbc:postgresql://localhost:5432/${project.slug}`,
    'spring.datasource.username=postgres',
    'spring.datasource.password=postgres',
    '',
    'spring.jpa.hibernate.ddl-auto=update',
    'spring.jpa.show-sql=false',
    'spring.jpa.properties.hibernate.format_sql=true',
    `springdoc.packages-to-scan=${project.basePackage}.controller`,
    '',
  ].join('\n')
}

/**
 * Genera el proyecto Spring Boot completo y devuelve los archivos a empaquetar
 * en el ZIP (con su ruta dentro del proyecto) junto al modelo intermedio.
 */
export function generateSpringBootProject(request: ValidatedGenerateRequest): {
  files: Record<string, string>
  project: JavaProject
} {
  const projectName = request.projectName
  const includeDto = request.includeDto
  const rootFolder = sanitizeFolderName(projectName)
  const { slug, basePackage } = basePackageFromProject(projectName)
  const applicationClassName = applicationClassNameFromProject(projectName)

  const project: JavaProject = {
    projectName,
    slug,
    basePackage,
    applicationClassName,
    rootFolder,
    classes: buildJavaClasses(request.diagram),
    includeDto,
  }

  const files: Record<string, string> = {}

  // Raíz y configuración
  files[`${rootFolder}/pom.xml`] = pomGenerator({ slug, name: projectName })
  files[`${rootFolder}/src/main/resources/application.properties`] = applicationPropertiesFile(project)

  // Clase principal
  const javaRoot = `${rootFolder}/src/main/java`
  const pkgPath = basePackage.split('.').join('/')
  files[`${javaRoot}/${pkgPath}/${applicationClassName}.java`] = appGenerator(basePackage, applicationClassName)

  // Clases UML → Entity / Repository / Service / Controller / DTO
  for (const cls of project.classes) {
    files[`${javaRoot}/${pkgPath}/entity/${cls.className}.java`] = entityGenerator(cls, basePackage)
    files[`${javaRoot}/${pkgPath}/repository/${cls.className}Repository.java`] = repositoryGenerator(cls, basePackage)
    files[`${javaRoot}/${pkgPath}/service/${cls.className}Service.java`] = serviceGenerator(cls, project)
    files[`${javaRoot}/${pkgPath}/controller/${cls.className}Controller.java`] = controllerGenerator(cls, project)
    if (includeDto) {
      files[`${javaRoot}/${pkgPath}/dto/${cls.className}Dto.java`] = dtoGenerator(cls, basePackage)
    }
  }

  return { files, project }
}