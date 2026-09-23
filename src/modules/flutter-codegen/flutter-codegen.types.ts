export interface FlutterCodegenRequest {
  app_name: string
  api_base_url: string
  diagram: UMLDiagram
}

export interface UMLDiagram {
  classes: Record<string, UMLClass>
  links?: Record<string, UMLRelation>
}

export interface UMLClass {
  id: string
  name: string
  attributes?: UMLAttribute[]
  methods?: unknown[]
  x?: number
  y?: number
  w?: number
  h?: number
}

export interface UMLAttribute {
  name: string
  type?: string
  vis?: string
  visibility?: string
}

export interface UMLRelation {
  id: string
  kind: string
  sourceId: string
  targetId: string
  labels?: {
    name?: string
    src?: string
    tgt?: string
  }
  assocClassId?: string
  anchorSrc?: unknown
  anchorTgt?: unknown
}

export interface FlutterProject {
  appName: string
  apiBaseUrl: string
  rootFolder: string
  classes: FlutterClass[]
  relations: FlutterRelation[]
  modules: FlutterModule[]
  files: FlutterFile[]
}

export interface FlutterClass {
  sourceId: string
  originalName: string
  dartName: string
  folderName: string
  fileName: string
  endpointRest: string
  serviceName: string
  providerName: string
  fields: FlutterField[]
  relations: FlutterRelation[]
}

export interface FlutterField {
  sourceName: string
  dartName: string
  dartType: string
  jsonType: string
  nullable: boolean
  isId: boolean
  isRelation: boolean
  relatedClassName?: string
}

export interface FlutterRelation {
  sourceId: string
  targetId: string
  sourceClassName: string
  targetClassName: string
  kind: string
  fieldName: string
  providerName: string
  needsDropdown: boolean
  cardinality?: string
  isGeneratedField: boolean
}

export interface FlutterModule {
  name: string
  className: string
  folderName: string
  modelPath: string
  servicePath: string
  providerPath: string
  listPagePath: string
  createPagePath: string
  editPagePath: string
  endpointRest: string
  operations: Array<'list' | 'getById' | 'create' | 'update' | 'delete'>
}

export interface FlutterFile {
  path: string
  content: string
  category: 'core' | 'model' | 'service' | 'provider' | 'page' | 'routing' | 'config'
}
