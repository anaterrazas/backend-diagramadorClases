"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFlutterProject = buildFlutterProject;
const TYPE_MAP = {
    string: { dartType: 'String', jsonType: 'string' },
    text: { dartType: 'String', jsonType: 'string' },
    char: { dartType: 'String', jsonType: 'string' },
    int: { dartType: 'int', jsonType: 'number' },
    integer: { dartType: 'int', jsonType: 'number' },
    bigint: { dartType: 'int', jsonType: 'number' },
    long: { dartType: 'int', jsonType: 'number' },
    float: { dartType: 'double', jsonType: 'number' },
    double: { dartType: 'double', jsonType: 'number' },
    decimal: { dartType: 'double', jsonType: 'number' },
    number: { dartType: 'num', jsonType: 'number' },
    bool: { dartType: 'bool', jsonType: 'boolean' },
    boolean: { dartType: 'bool', jsonType: 'boolean' },
    date: { dartType: 'DateTime', jsonType: 'string' },
    datetime: { dartType: 'DateTime', jsonType: 'string' },
    timestamp: { dartType: 'DateTime', jsonType: 'string' },
    time: { dartType: 'String', jsonType: 'string' },
    uuid: { dartType: 'String', jsonType: 'string' },
    json: { dartType: 'Map<String, dynamic>', jsonType: 'object' },
};
const CRUD_OPERATIONS = [
    'list',
    'getById',
    'create',
    'update',
    'delete',
];
/** Builds the semantic Flutter representation without generating Dart content. */
function buildFlutterProject(request) {
    const classes = Object.values(request.diagram.classes ?? {});
    const flutterClasses = classes.map((item) => buildFlutterClass(item, classes, request.diagram.links ?? {}));
    const relations = flutterClasses.flatMap((item) => item.relations);
    return {
        appName: request.app_name,
        apiBaseUrl: request.api_base_url,
        rootFolder: request.app_name,
        classes: flutterClasses,
        relations,
        modules: flutterClasses.map(buildFlutterModule),
        files: [],
    };
}
function buildFlutterClass(umlClass, allClasses, links) {
    const dartName = umlClass.name.trim();
    const folderName = dartName;
    const fileName = toFileName(dartName);
    const classByName = new Map(allClasses.map((item) => [item.name.toLowerCase(), item]));
    const fields = (umlClass.attributes ?? []).map((attribute) => buildFlutterField(attribute, classByName));
    if (!fields.some((field) => field.isId)) {
        fields.unshift({
            sourceName: 'id',
            dartName: 'id',
            dartType: 'int',
            jsonType: 'number',
            nullable: true,
            isId: true,
            isRelation: false,
        });
    }
    const fieldRelations = fields
        .filter((field) => field.isRelation && field.relatedClassName)
        .map((field) => relationFromField(umlClass, field, classByName));
    const linkRelations = Object.values(links)
        .filter((link) => link.sourceId === umlClass.id)
        .map((link) => relationFromLink(umlClass, link, allClasses, fields));
    for (const relation of linkRelations) {
        if (!relation.isGeneratedField || fields.some((field) => field.dartName === relation.fieldName))
            continue;
        fields.push({
            sourceName: relation.fieldName,
            dartName: relation.fieldName,
            dartType: 'int',
            jsonType: 'number',
            nullable: true,
            isId: false,
            isRelation: true,
            relatedClassName: relation.targetClassName,
        });
    }
    const relations = [...fieldRelations, ...linkRelations];
    return {
        sourceId: umlClass.id,
        originalName: umlClass.name,
        dartName,
        folderName,
        fileName,
        endpointRest: `/api/${fileName}`,
        serviceName: `${dartName}Service`,
        providerName: `${dartName}Provider`,
        fields,
        relations: uniqueRelations(relations),
    };
}
function buildFlutterField(attribute, classByName) {
    const sourceName = stripVisibility(attribute.name);
    const dartName = toFieldName(sourceName);
    const relatedName = relationClassNameFromField(dartName, classByName);
    const type = TYPE_MAP[(attribute.type ?? '').trim().toLowerCase()] ?? {
        dartType: 'String',
        jsonType: 'string',
    };
    return {
        sourceName,
        dartName,
        dartType: relatedName ? 'int' : type.dartType,
        jsonType: relatedName ? 'number' : type.jsonType,
        nullable: dartName.toLowerCase() === 'id' || Boolean(relatedName) || type.dartType === 'DateTime',
        isId: dartName.toLowerCase() === 'id',
        isRelation: Boolean(relatedName),
        relatedClassName: relatedName,
    };
}
function relationFromField(source, field, classByName) {
    const target = classByName.get(field.relatedClassName.toLowerCase());
    return {
        sourceId: source.id,
        targetId: target.id,
        sourceClassName: source.name,
        targetClassName: target.name,
        kind: 'field-reference',
        fieldName: field.dartName,
        providerName: `${target.name}Provider`,
        needsDropdown: true,
        isGeneratedField: false,
    };
}
function relationFromLink(source, link, allClasses, fields) {
    const target = allClasses.find((item) => item.id === link.targetId);
    const fieldName = target ? `${toFieldName(target.name)}Id` : 'relatedId';
    const existingField = fields.find((field) => field.dartName === fieldName);
    return {
        sourceId: source.id,
        targetId: link.targetId,
        sourceClassName: source.name,
        targetClassName: target?.name ?? link.targetId,
        kind: link.kind,
        fieldName,
        providerName: `${target?.name ?? link.targetId}Provider`,
        needsDropdown: Boolean(target),
        cardinality: link.labels?.tgt,
        isGeneratedField: !existingField,
    };
}
function buildFlutterModule(item) {
    const base = `lib/features/${item.folderName}`;
    return {
        name: item.fileName,
        className: item.dartName,
        folderName: item.folderName,
        modelPath: `${base}/models/${item.fileName}.dart`,
        servicePath: `${base}/data/${item.fileName}_service.dart`,
        providerPath: `${base}/state/${item.fileName}_provider.dart`,
        listPagePath: `${base}/pages/${item.fileName}_list_page.dart`,
        createPagePath: `${base}/pages/${item.fileName}_create_page.dart`,
        editPagePath: `${base}/pages/${item.fileName}_edit_page.dart`,
        endpointRest: item.endpointRest,
        operations: CRUD_OPERATIONS,
    };
}
function relationClassNameFromField(fieldName, classByName) {
    if (!fieldName.toLowerCase().endsWith('id'))
        return undefined;
    const candidate = fieldName.slice(0, -2).toLowerCase();
    return classByName.get(candidate)?.name;
}
function uniqueRelations(relations) {
    const seen = new Set();
    return relations.filter((relation) => {
        const key = `${relation.sourceId}:${relation.targetId}:${relation.fieldName}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function stripVisibility(name) {
    return name.trim().replace(/^[+\-#~]\s*/, '');
}
function toFieldName(name) {
    const parts = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
    if (parts.length === 0)
        return 'field';
    const first = parts[0].charAt(0).toLowerCase() + parts[0].slice(1);
    return first + parts.slice(1).map(capitalize).join('');
}
function toFileName(name) {
    return toFieldName(name);
}
function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
