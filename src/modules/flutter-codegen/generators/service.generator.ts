import type { FlutterClass, FlutterField, FlutterFile, FlutterProject } from '../flutter-codegen.types'

export function generateServiceFile(flutterClass: FlutterClass): FlutterFile {
  const idType = getIdType(flutterClass.fields)
  const model = flutterClass.dartName
  const fileName = flutterClass.fileName
  const endpoint = flutterClass.endpointRest

  const content = `import 'package:dio/dio.dart';
import '../../../core/api_client.dart';
import '../models/${fileName}.dart';

class ${flutterClass.serviceName} {
  final Dio _dio = ApiClient.dio;

  Future<List<${model}>> list() async {
    final res = await _dio.get('${endpoint}');
    final data = res.data as List;
    return data.map((e) => ${model}.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<${model}> getById(${idType} id) async {
    final res = await _dio.get('${endpoint}/$id');
    return ${model}.fromJson(Map<String, dynamic>.from(res.data));
  }

  Future<${model}> create(${model} item) async {
    final res = await _dio.post('${endpoint}', data: item.toJson());
    return ${model}.fromJson(Map<String, dynamic>.from(res.data));
  }

  Future<${model}> update(${idType} id, ${model} item) async {
    final res = await _dio.put('${endpoint}/$id', data: item.toJson());
    return ${model}.fromJson(Map<String, dynamic>.from(res.data));
  }

  Future<void> delete(${idType} id) async {
    await _dio.delete('${endpoint}/$id');
  }
}
`

  return {
    path: `lib/features/${flutterClass.folderName}/data/${fileName}_service.dart`,
    content,
    category: 'service',
  }
}

export function generateServiceFiles(project: FlutterProject): FlutterFile[] {
  return project.classes.map(generateServiceFile)
}

function getIdType(fields: FlutterField[]): string {
  return fields.find((field) => field.isId)?.dartType ?? 'int'
}
