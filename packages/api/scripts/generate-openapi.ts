import 'reflect-metadata'; // Required for TSyringe
import { createApp } from '../src/app';
import { container } from 'tsyringe';
import { resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

async function generateOpenApiSpec() {
  const app = createApp(); // Assuming createApp initializes the DI container and app
  const spec = app.getOpenAPISpec();

  const docsDir = resolve(__dirname, '../docs');
  const outputPath = resolve(docsDir, 'openapi.json');

  try {
    mkdirSync(docsDir, { recursive: true });
    writeFileSync(outputPath, JSON.stringify(spec, null, 2));
    console.log(`OpenAPI spec generated successfully at ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to generate OpenAPI spec:', error);
    process.exit(1);
  }
}

generateOpenApiSpec();