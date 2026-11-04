import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenApiValidator from 'express-openapi-validator';

import config from '../config/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const isCompiled = currentDir.includes(`${path.sep}dist${path.sep}`);
const projectRoot = path.resolve(currentDir, isCompiled ? '../../../..' : '../../..');
const apiSpecPath = path.join(projectRoot, 'contracts/openapi.bundled.yaml');

/**
 * Einzige Instanz des OpenAPI-Validators. Wird von allen Feature-Routern
 * gemeinsam verwendet, immer nach den bestehenden Validierungs-Middlewares.
 */
export const openApiMiddleware = OpenApiValidator.middleware({
  apiSpec: apiSpecPath,
  validateRequests: {
    allowUnknownQueryParameters: false,
    removeAdditional: false,
    coerceTypes: false,
  },
  // Responses werden nur in Tests und Entwicklung validiert.
  validateResponses: config.env !== 'production',
  validateSecurity: false,
});
