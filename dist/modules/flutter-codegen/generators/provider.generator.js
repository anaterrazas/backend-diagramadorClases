"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProviderFile = generateProviderFile;
exports.generateProviderFiles = generateProviderFiles;
function generateProviderFile(flutterClass) {
    const model = flutterClass.dartName;
    const idType = getIdType(flutterClass.fields);
    const fileName = flutterClass.fileName;
    const content = `import 'package:flutter/foundation.dart';
import '../models/${fileName}.dart';
import '../data/${fileName}_service.dart';

class ${flutterClass.providerName} extends ChangeNotifier {
  final ${flutterClass.serviceName} _service = ${flutterClass.serviceName}();
  bool loading = false;
  List<${model}> items = [];
  String? error;

  Future<void> fetchAll() async {
    loading = true; error = null; notifyListeners();
    try {
      items = await _service.list();
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false; notifyListeners();
    }
  }

  Future<void> create(${model} item) async {
    loading = true; notifyListeners();
    try {
      final created = await _service.create(item);
      items.add(created);
    } finally {
      loading = false; notifyListeners();
    }
  }

  Future<void> updateItem(${idType} id, ${model} item) async {
    loading = true; notifyListeners();
    try {
      final updated = await _service.update(id, item);
      final idx = items.indexWhere((e) => e.id == id);
      if (idx != -1) items[idx] = updated;
    } finally {
      loading = false; notifyListeners();
    }
  }

  Future<void> deleteById(${idType} id) async {
    loading = true; notifyListeners();
    try {
      await _service.delete(id);
      items.removeWhere((e) => e.id == id);
    } finally {
      loading = false; notifyListeners();
    }
  }
}
`;
    return {
        path: `lib/features/${flutterClass.folderName}/state/${fileName}_provider.dart`,
        content,
        category: 'provider',
    };
}
function generateProviderFiles(project) {
    return project.classes.map(generateProviderFile);
}
function getIdType(fields) {
    return fields.find((field) => field.isId)?.dartType ?? 'int';
}
