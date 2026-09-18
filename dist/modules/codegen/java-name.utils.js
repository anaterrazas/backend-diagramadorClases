"use strict";
// src/modules/codegen/java-name.utils.ts
// Sanitización de identificadores Java: evita generar código inválido.
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = tokenize;
exports.capitalize = capitalize;
exports.sanitizeClassName = sanitizeClassName;
exports.sanitizeFieldName = sanitizeFieldName;
exports.slugFromProjectName = slugFromProjectName;
exports.basePackageFromProject = basePackageFromProject;
exports.applicationClassNameFromProject = applicationClassNameFromProject;
exports.sanitizeFolderName = sanitizeFolderName;
exports.zipBaseName = zipBaseName;
const JAVA_RESERVED = new Set([
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
    'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final',
    'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int',
    'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public',
    'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
    'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false',
    'null', 'var', 'record', 'yield', 'sealed', 'permits', '_',
]);
/** Separa el texto en palabras alfanuméricas (incluidas transiciones lower→Upper). */
function tokenize(raw) {
    const s = (raw ?? '').trim();
    if (!s)
        return [];
    const tokens = [];
    for (const part of s.split(/[^A-Za-z0-9]+/)) {
        if (!part)
            continue;
        const words = part.split(/(?<=[a-z0-9])(?=[A-Z])/);
        for (const w of words)
            if (w)
                tokens.push(w);
    }
    return tokens;
}
function capitalize(word) {
    return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}
/**
 * Nombre de clase en PascalCase:
 * - "persona" -> "Persona"; "Persona datos" -> "PersonaDatos"
 * - dígitos iniciales se mueven al final: "123Persona" -> "Persona123"
 * - palabras reservadas en minúsculas dejan de serlo en PascalCase ("class" -> "Class")
 */
function sanitizeClassName(raw) {
    const tokens = tokenize(raw);
    if (tokens.length === 0)
        return 'Clase';
    const leadingDigits = [];
    while (tokens.length && /^\d+$/.test(tokens[0]))
        leadingDigits.push(tokens.shift());
    let name = tokens.map(capitalize).join('') + leadingDigits.join('');
    if (/^[0-9]/.test(name))
        name = `_${name}`;
    if (!name)
        name = 'Clase';
    if (JAVA_RESERVED.has(name))
        name = `${name}_`;
    return name;
}
/**
 * Nombre de variable/método en camelCase:
 * - "nombre-completo" -> "nombreCompleto"; "Nombre Completo" -> "nombreCompleto"
 * - dígitos iniciales se mueven al final: "123peso" -> "peso123"
 * - palabra reservada -> sufijo "_": "class" -> "class_"
 */
function sanitizeFieldName(raw) {
    const tokens = tokenize(raw);
    if (tokens.length === 0)
        return 'campo';
    const leadingDigits = [];
    while (tokens.length && /^\d+$/.test(tokens[0]))
        leadingDigits.push(tokens.shift());
    let name = tokens[0].toLowerCase() + tokens.slice(1).map(capitalize).join('') + leadingDigits.join('');
    if (!name)
        name = 'campo';
    if (/^[0-9]/.test(name))
        name = `_${name}`;
    if (JAVA_RESERVED.has(name))
        name = `${name}_`;
    return name;
}
/**
 * Slug para package/artifact: "demo-sources" -> "demosources".
 * Cada segmento no puede ser palabra reservada ni empezar por dígito.
 */
function slugFromProjectName(projectName) {
    const segments = (projectName || 'demo-sources')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
    const cleaned = [];
    for (let seg of segments) {
        if (/^[0-9]/.test(seg))
            seg = `_${seg}`;
        if (JAVA_RESERVED.has(seg))
            seg = `${seg}_`;
        cleaned.push(seg);
    }
    return cleaned.join('') || 'demosources';
}
/** Paquete base a partir del nombre del proyecto: com.example.<slug>. */
function basePackageFromProject(projectName) {
    const slug = slugFromProjectName(projectName);
    return { slug, basePackage: `com.example.${slug}` };
}
/** Nombre de clase @SpringBootApplication: "demo-sources" -> "DemoSourcesApplication". */
function applicationClassNameFromProject(projectName) {
    return `${sanitizeClassName(projectName)}Application`;
}
/** Carpeta raíz segura para el ZIP (permite guiones; no es un identificador Java). */
function sanitizeFolderName(raw) {
    const cleaned = (raw ?? '')
        .trim()
        .replace(/[^A-Za-z0-9._-]+/g, '-')
        .replace(/^(-|\.)+|-+$/g, '');
    return cleaned && cleaned !== '.' && cleaned !== '..' ? cleaned : 'demo-sources';
}
/** Nombre de archivo ZIP seguro: <carpeta>.zip */
function zipBaseName(projectName) {
    return `${sanitizeFolderName(projectName)}.zip`;
}
