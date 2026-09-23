"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFlutterProject = generateFlutterProject;
exports.generateFlutterZip = generateFlutterZip;
const zip_service_1 = require("../codegen/zip.service");
const flutter_codegen_validator_1 = require("./flutter-codegen.validator");
const flutter_codegen_model_1 = require("./flutter-codegen.model");
const api_client_generator_1 = require("./generators/api-client.generator");
const app_providers_generator_1 = require("./generators/app-providers.generator");
const main_generator_1 = require("./generators/main.generator");
const model_generator_1 = require("./generators/model.generator");
const service_generator_1 = require("./generators/service.generator");
const provider_generator_1 = require("./generators/provider.generator");
const list_page_generator_1 = require("./generators/list-page.generator");
const create_page_generator_1 = require("./generators/create-page.generator");
const edit_page_generator_1 = require("./generators/edit-page.generator");
function generateFlutterProject(body) {
    const request = (0, flutter_codegen_validator_1.validateFlutterCodegenRequest)(body);
    const project = (0, flutter_codegen_model_1.buildFlutterProject)(request);
    const files = generateFiles(project);
    project.files = files;
    return project;
}
async function generateFlutterZip(body) {
    const project = generateFlutterProject(body);
    const files = Object.fromEntries(project.files.map((file) => [file.path, file.content]));
    return (0, zip_service_1.createZipFromFiles)(files);
}
function generateFiles(project) {
    return [
        (0, api_client_generator_1.generateApiClientFile)(project),
        (0, app_providers_generator_1.generateAppProvidersFile)(project),
        ...(0, model_generator_1.generateModelFiles)(project),
        ...(0, service_generator_1.generateServiceFiles)(project),
        ...(0, provider_generator_1.generateProviderFiles)(project),
        ...(0, list_page_generator_1.generateListPageFiles)(project),
        ...(0, create_page_generator_1.generateCreatePageFiles)(project),
        ...(0, edit_page_generator_1.generateEditPageFiles)(project),
        (0, main_generator_1.generateMainFile)(project),
    ];
}
