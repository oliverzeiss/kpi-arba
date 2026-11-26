import { registerHooks } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

registerHooks({
  resolve(specifier, context, nextResolve) {
    let targetPath = null;

    if (specifier.startsWith('@/')) {
      targetPath = path.join(projectRoot, 'src', specifier.slice(2));
    } else if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      context.parentURL?.startsWith('file://') &&
      !path.extname(specifier)
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      targetPath = path.resolve(parentDir, specifier);
    }

    if (targetPath) {
      for (const candidate of [
        `${targetPath}.ts`,
        `${targetPath}.tsx`,
        path.join(targetPath, 'index.ts'),
      ]) {
        if (fs.existsSync(candidate)) {
          return { url: pathToFileURL(candidate).href, shortCircuit: true };
        }
      }
    }

    return nextResolve(specifier, context);
  },

  load(url, context, nextLoad) {
    if (url.endsWith('.ts') || url.endsWith('.tsx')) {
      const filePath = fileURLToPath(url);
      const source = fs.readFileSync(filePath, 'utf8');
      const result = ts.transpileModule(source, {
        fileName: filePath,
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.React,
          esModuleInterop: true,
        },
      });
      return { format: 'module', source: result.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
