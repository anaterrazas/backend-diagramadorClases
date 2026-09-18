"use strict";
// src/modules/codegen/codegen.service.ts
// Orquestador del generador local de Spring Boot.
//
// Flujo: JSON v2 → modelo intermedio Java → archivos del proyecto → ZIP.
// El JSON v2 se consume tal cual (contrato del editor); nunca se modifica.
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapJavaType = mapJavaType;
exports.validateGenerateRequest = validateGenerateRequest;
exports.generateSpringBootProject = generateSpringBootProject;
const http_error_1 = require("../../utils/http-error");
const java_name_utils_1 = require("./java-name.utils");
const app_generator_1 = require("./app.generator");
const pom_generator_1 = require("./pom.generator");
const entity_generator_1 = require("./entity.generator");
const repository_generator_1 = require("./repository.generator");
const service_generator_1 = require("./service.generator");
const controller_generator_1 = require("./controller.generator");
const dto_generator_1 = require("./dto.generator");
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
const TYPE_MAP = {
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
};
function mapJavaType(type) {
    const t = (type ?? '').trim().toLowerCase();
    return TYPE_MAP[t] ?? 'String';
}
function isNumericBoundJavaType(javaType) {
    return Boolean(javaType) && ['Long', 'Integer', 'Short', 'Byte', 'Float', 'Double', 'BigDecimal'].includes(javaType);
}
/**
 * Valida el cuerpo del request. Errores simples de entrada → HttpError(400),
 * que el error-handler global convierte en JSON (sin HTML ni stack).
 */
function validateGenerateRequest(body) {
    if (!body || typeof body !== 'object') {
        throw new http_error_1.HttpError('El cuerpo de la petición debe ser un objeto JSON', 400);
    }
    const { projectName, includeDto, diagram } = body;
    if (!diagram || typeof diagram !== 'object' || typeof diagram.classes !== 'object') {
        throw new http_error_1.HttpError('El campo "diagram" es obligatorio y debe contener "classes"', 400);
    }
    return {
        projectName: typeof projectName === 'string' && projectName.trim() ? projectName.trim() : 'demo-sources',
        includeDto: includeDto !== false,
        diagram: diagram,
    };
}
/** Construye el modelo intermedio Java a partir del diagrama v2. */
function buildJavaClasses(diagram) {
    const rawClasses = Object.values(diagram.classes ?? {});
    const classNameById = new Map();
    for (const c of rawClasses) {
        if (c?.id)
            classNameById.set(c.id, (0, java_name_utils_1.sanitizeClassName)(c?.name));
    }
    // Generalization: sourceId = subclase (specific), targetId = superclase (general).
    const parentByChild = new Map();
    const parentsWithSubclasses = new Set();
    for (const l of Object.values(diagram.links ?? {})) {
        const kind = (l?.kind ?? '').toLowerCase();
        if (kind !== 'generalize')
            continue;
        const child = classNameById.get(l.sourceId);
        const parent = classNameById.get(l.targetId);
        if (child && parent && child !== parent) {
            parentByChild.set(child, parent);
            parentsWithSubclasses.add(parent);
        }
    }
    return rawClasses.map((c) => {
        const className = (0, java_name_utils_1.sanitizeClassName)(c?.name);
        return {
            className,
            tableName: className.toLowerCase(),
            fields: buildFields(c?.attributes ?? []),
            parentClassName: parentByChild.get(className),
            isParentWithSubclasses: parentsWithSubclasses.has(className),
        };
    });
}
/**
 * Construye los campos Java de la clase.
 *
 * Decisión de ID (solo interna al CodeGen, el UML nunca se modifica):
 * - Si la clase tiene un atributo llamado "id" (case-insensitive), se usa como
 *   @Id. Si además su tipo mapeado es numérico se marca @GeneratedValue(IDENTITY).
 * - Si no lo tiene, se sintetiza "private Long id" con @GeneratedValue(IDENTITY).
 */
function buildFields(attributes) {
    const fields = [];
    let hasExplicitId = false;
    for (const a of attributes ?? []) {
        // Corta el símbolo de visibilidad si quedó pegado al nombre (defensivo).
        const rawName = (a?.name ?? '').trim().replace(/^[+\-#~]\s*/, '');
        if (!rawName)
            continue;
        const javaType = mapJavaType(a?.type);
        const isId = rawName.toLowerCase() === 'id';
        const autoGeneratedId = isId && isNumericBoundJavaType(javaType);
        if (isId)
            hasExplicitId = true;
        fields.push({
            name: (0, java_name_utils_1.sanitizeFieldName)(rawName),
            javaType,
            isId,
            autoGeneratedId,
        });
    }
    if (!hasExplicitId) {
        fields.unshift({ name: 'id', javaType: 'Long', isId: true, autoGeneratedId: true });
    }
    return fields;
}
function applicationPropertiesFile(project) {
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
    ].join('\n');
}
/**
 * Genera el proyecto Spring Boot completo y devuelve los archivos a empaquetar
 * en el ZIP (con su ruta dentro del proyecto) junto al modelo intermedio.
 */
function generateSpringBootProject(request) {
    const projectName = request.projectName;
    const includeDto = request.includeDto;
    const rootFolder = (0, java_name_utils_1.sanitizeFolderName)(projectName);
    const { slug, basePackage } = (0, java_name_utils_1.basePackageFromProject)(projectName);
    const applicationClassName = (0, java_name_utils_1.applicationClassNameFromProject)(projectName);
    const project = {
        projectName,
        slug,
        basePackage,
        applicationClassName,
        rootFolder,
        classes: buildJavaClasses(request.diagram),
        includeDto,
    };
    const files = {};
    // Raíz y configuración
    files[`${rootFolder}/pom.xml`] = (0, pom_generator_1.pomGenerator)({ slug, name: projectName });
    files[`${rootFolder}/src/main/resources/application.properties`] = applicationPropertiesFile(project);
    // Clase principal
    const javaRoot = `${rootFolder}/src/main/java`;
    const pkgPath = basePackage.split('.').join('/');
    files[`${javaRoot}/${pkgPath}/${applicationClassName}.java`] = (0, app_generator_1.appGenerator)(basePackage, applicationClassName);
    // Clases UML → Entity / Repository / Service / Controller / DTO
    for (const cls of project.classes) {
        files[`${javaRoot}/${pkgPath}/entity/${cls.className}.java`] = (0, entity_generator_1.entityGenerator)(cls, basePackage);
        files[`${javaRoot}/${pkgPath}/repository/${cls.className}Repository.java`] = (0, repository_generator_1.repositoryGenerator)(cls, basePackage);
        files[`${javaRoot}/${pkgPath}/service/${cls.className}Service.java`] = (0, service_generator_1.serviceGenerator)(cls, project);
        files[`${javaRoot}/${pkgPath}/controller/${cls.className}Controller.java`] = (0, controller_generator_1.controllerGenerator)(cls, project);
        if (includeDto) {
            files[`${javaRoot}/${pkgPath}/dto/${cls.className}Dto.java`] = (0, dto_generator_1.dtoGenerator)(cls, basePackage);
        }
    }
    return { files, project };
}
