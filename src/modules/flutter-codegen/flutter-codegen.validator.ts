import { HttpError } from '../../utils/http-error'
import type {
  FlutterCodegenRequest,
  UMLAttribute,
  UMLClass,
  UMLDiagram,
  UMLRelation,
} from './flutter-codegen.types'

export const DEFAULT_FLUTTER_APP_NAME = 'mi_flutter_app'
export const DEFAULT_FLUTTER_API_BASE_URL = 'http://192.168.31.77:8080'

/**
 * Validates only the shape required by the historical Flutter generator.
 * Unknown UML types remain accepted and are handled by the intermediate model.
 */
export function validateFlutterCodegenRequest(body: unknown): FlutterCodegenRequest {
  if (!isRecord(body)) {
    throw new HttpError('El cuerpo de la petición debe ser un objeto JSON', 400)
  }

  const appName = optionalString(body.app_name) || DEFAULT_FLUTTER_APP_NAME
  const apiBaseUrl = optionalString(body.api_base_url) || DEFAULT_FLUTTER_API_BASE_URL
  const diagram = validateDiagram(body.diagram)

  return {
    app_name: appName,
    api_base_url: apiBaseUrl,
    diagram,
  }
}

function validateDiagram(value: unknown): UMLDiagram {
  if (!isRecord(value)) {
    throw new HttpError('El campo "diagram" es obligatorio y debe ser un objeto', 400)
  }

  if (!isRecord(value.classes) || Array.isArray(value.classes)) {
    throw new HttpError('El campo "diagram.classes" es obligatorio y debe ser un objeto', 400)
  }

  const classes: Record<string, UMLClass> = {}
  for (const [key, candidate] of Object.entries(value.classes)) {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || !candidate.id.trim()) {
      throw new HttpError(`La clase "${key}" debe tener un id válido`, 400)
    }
    if (typeof candidate.name !== 'string' || !candidate.name.trim()) {
      throw new HttpError(`La clase "${key}" debe tener un nombre válido`, 400)
    }

    const attributes = candidate.attributes === undefined
      ? []
      : normalizeAttributes(candidate.attributes, candidate.name)

    classes[key] = {
      id: candidate.id,
      name: candidate.name,
      attributes,
      methods: Array.isArray(candidate.methods) ? candidate.methods : [],
      x: asNumber(candidate.x),
      y: asNumber(candidate.y),
      w: asNumber(candidate.w),
      h: asNumber(candidate.h),
    }
  }

  const links = validateRelations(value.links, classes)
  return { classes, links }
}

function normalizeAttributes(value: unknown, className: string): UMLAttribute[] {
  if (!Array.isArray(value)) {
    throw new HttpError(`Los atributos de "${className}" deben ser iterables`, 400)
  }

  return value.map((candidate, index) => {
    if (!isRecord(candidate) || typeof candidate.name !== 'string' || !candidate.name.trim()) {
      throw new HttpError(`El atributo ${index + 1} de "${className}" debe tener un nombre válido`, 400)
    }

    // Do not reject unknown types; the historical generator falls back safely.
    return {
      name: candidate.name,
      type: typeof candidate.type === 'string' ? candidate.type : undefined,
      vis: typeof candidate.vis === 'string' ? candidate.vis : undefined,
      visibility: typeof candidate.visibility === 'string' ? candidate.visibility : undefined,
    }
  })
}

function validateRelations(
  value: unknown,
  classes: Record<string, UMLClass>,
): Record<string, UMLRelation> {
  if (value === undefined) return {}
  if (!isRecord(value) || Array.isArray(value)) {
    throw new HttpError('El campo "diagram.links" debe ser un objeto', 400)
  }

  const classIds = new Set(Object.values(classes).map((item) => item.id))
  const links: Record<string, UMLRelation> = {}

  for (const [key, candidate] of Object.entries(value)) {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== 'string' ||
      !candidate.id.trim() ||
      typeof candidate.kind !== 'string' ||
      typeof candidate.sourceId !== 'string' ||
      typeof candidate.targetId !== 'string'
    ) {
      throw new HttpError(`La relación "${key}" tiene una estructura inválida`, 400)
    }
    if (!classIds.has(candidate.sourceId)) {
      throw new HttpError(`La relación "${key}" referencia un sourceId inexistente`, 400)
    }
    if (!classIds.has(candidate.targetId)) {
      throw new HttpError(`La relación "${key}" referencia un targetId inexistente`, 400)
    }

    links[key] = {
      id: candidate.id,
      kind: candidate.kind,
      sourceId: candidate.sourceId,
      targetId: candidate.targetId,
      labels: isRecord(candidate.labels)
        ? {
            name: optionalString(candidate.labels.name),
            src: optionalString(candidate.labels.src),
            tgt: optionalString(candidate.labels.tgt),
          }
        : undefined,
      assocClassId: optionalString(candidate.assocClassId),
      anchorSrc: candidate.anchorSrc,
      anchorTgt: candidate.anchorTgt,
    }
  }

  return links
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}
