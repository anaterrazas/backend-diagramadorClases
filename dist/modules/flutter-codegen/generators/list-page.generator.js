"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateListPageFile = generateListPageFile;
exports.generateListPageFiles = generateListPageFiles;
function generateListPageFile(flutterClass) {
    const modelFile = flutterClass.fileName;
    const visibleFields = flutterClass.fields
        .filter((field) => !field.isId && !field.isRelation)
        .slice(0, 2);
    const titleParts = visibleFields.map((field) => `parts.add('${field.sourceName}: ${fieldValue(field)}');`).join(' ');
    const titleFallback = visibleFields.length === 0
        ? `parts.add(item.toString());`
        : '';
    const content = `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/${modelFile}.dart';
import '../state/${modelFile}_provider.dart';
import '${modelFile}_create_page.dart';
import '${modelFile}_edit_page.dart';

class ${flutterClass.dartName}ListPage extends StatefulWidget {
  const ${flutterClass.dartName}ListPage({super.key});

  @override
  State<${flutterClass.dartName}ListPage> createState() => _${flutterClass.dartName}ListPageState();
}

class _${flutterClass.dartName}ListPageState extends State<${flutterClass.dartName}ListPage> {
  String _titleOf(item) {
    final parts = <String>[]; ${titleParts} ${titleFallback}
    return parts.join('  |  ');
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<${flutterClass.providerName}>().fetchAll());
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<${flutterClass.providerName}>();
    return Scaffold(
      appBar: AppBar(title: const Text('${flutterClass.dartName}')),
      body: p.loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.separated(
              itemCount: p.items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final item = p.items[i];
                return Dismissible(
                  key: ValueKey(item.id ?? i),
                  background: Container(color: Colors.red),
                  onDismissed: (_) => context.read<${flutterClass.providerName}>().deleteById(item.id!),
                  child: ListTile(
                    title: Text(_titleOf(item)),
                    subtitle: Text('ID: ' + (item.id?.toString() ?? '-')),
                    trailing: IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => ${flutterClass.dartName}EditPage(itemId: item.id)),
                      ),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const ${flutterClass.dartName}CreatePage()),
        ),
        child: const Icon(Icons.add),
      ),
    );
  }
}
`;
    return {
        path: `lib/features/${flutterClass.folderName}/pages/${modelFile}_list_page.dart`,
        content,
        category: 'page',
    };
}
function generateListPageFiles(project) {
    return project.classes.map(generateListPageFile);
}
function fieldValue(field) {
    if (field.dartType === 'bool') {
        return `\${(item.${field.dartName} == true) ? "Sí" : "No"}`;
    }
    return `\${item.${field.dartName} ?? "-"}`;
}
