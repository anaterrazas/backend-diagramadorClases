import type { FlutterFile, FlutterProject } from '../flutter-codegen.types'

export function generateApiClientFile(project: FlutterProject): FlutterFile {
  const content = `import 'package:dio/dio.dart';

class ApiClient {
  static final Dio dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_BASE_URL',
        defaultValue: '${project.apiBaseUrl}'),
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));
}
`

  return {
    path: 'lib/core/api_client.dart',
    content,
    category: 'core',
  }
}
