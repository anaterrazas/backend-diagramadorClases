import type { FlutterFile, FlutterProject } from '../flutter-codegen.types'

export function generateAppProvidersFile(project: FlutterProject): FlutterFile {
  const imports = project.modules
    .map((module) => `import '../features/${module.folderName}/state/${module.name}_provider.dart';`)
    .join('\n')

  const providers = project.modules
    .map((module) => `ChangeNotifierProvider(create: (_) => ${module.className}Provider()),`)
    .join(' ')

  const content = `import 'package:provider/provider.dart';
import 'package:provider/single_child_widget.dart';
${imports}

class AppProviders {
  static List<SingleChildWidget> all() => [${providers}];
}
`

  return {
    path: 'lib/core/app_providers.dart',
    content,
    category: 'core',
  }
}
