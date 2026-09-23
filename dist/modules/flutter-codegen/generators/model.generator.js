"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModelFile = generateModelFile;
exports.generateModelFiles = generateModelFiles;
function generateModelFile(flutterClass) {
    const fields = flutterClass.fields.map(generateFieldDeclaration).join('');
    const constructorFields = flutterClass.fields.map(generateConstructorField).join('');
    const fromJsonFields = flutterClass.fields.map(generateFromJsonField).join('');
    const toJsonFields = flutterClass.fields
        .filter((field) => !field.isId)
        .map(generateToJsonField)
        .join('');
    const content = `class ${flutterClass.dartName} {
${fields}
  const ${flutterClass.dartName}({
${constructorFields}  });

  // ---- helpers parseo seguros ----
  static int _asIntNonNull(dynamic v) {
    if (v is int) return v;
    if (v is double) return v.toInt();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }
  static double _asDoubleNonNull(dynamic v) {
    if (v is double) return v;
    if (v is int) return v.toDouble();
    if (v is String) return double.tryParse(v) ?? 0.0;
    return 0.0;
  }
  static bool _asBoolNonNull(dynamic v) {
    if (v is bool) return v;
    if (v is num) return v != 0;
    if (v is String) return ['true','1','t','y','yes','si','sí'].contains(v.toLowerCase());
    return false;
  }
  static DateTime? _asDateTime(dynamic v) {
    if (v == null) return null;
    if (v is DateTime) return v;
    final s = v.toString();
    return DateTime.tryParse(s);
  }
  static String _asStringNonNull(dynamic v) => v?.toString() ?? '';

  factory ${flutterClass.dartName}.fromJson(Map<String, dynamic> json) => ${flutterClass.dartName}(
${fromJsonFields}  );

  Map<String, dynamic> toJson() => {
${toJsonFields}  };
}
`;
    return {
        path: `lib/features/${flutterClass.folderName}/models/${flutterClass.fileName}.dart`,
        content,
        category: 'model',
    };
}
function generateModelFiles(project) {
    return project.classes.map(generateModelFile);
}
function generateFieldDeclaration(field) {
    return `  final ${field.dartType}${field.nullable ? '?' : ''} ${field.dartName};\n`;
}
function generateConstructorField(field) {
    const required = field.isId || field.nullable ? '' : 'required ';
    return `    ${required}this.${field.dartName},`;
}
function generateFromJsonField(field) {
    const expression = fromJsonExpression(field);
    return `    ${field.dartName}: ${expression},`;
}
function generateToJsonField(field) {
    const expression = field.dartType === 'DateTime'
        ? `${field.dartName}?.toIso8601String()`
        : field.dartName;
    return `    '${field.sourceName}': ${expression},`;
}
function fromJsonExpression(field) {
    if (field.isId || field.isRelation)
        return `json['${field.sourceName}']`;
    if (field.dartType === 'String')
        return `_asStringNonNull(json['${field.sourceName}'])`;
    if (field.dartType === 'int')
        return `_asIntNonNull(json['${field.sourceName}'])`;
    if (field.dartType === 'double')
        return `_asDoubleNonNull(json['${field.sourceName}'])`;
    if (field.dartType === 'bool')
        return `_asBoolNonNull(json['${field.sourceName}'])`;
    if (field.dartType === 'DateTime')
        return `_asDateTime(json['${field.sourceName}'])`;
    return `json['${field.sourceName}']`;
}
