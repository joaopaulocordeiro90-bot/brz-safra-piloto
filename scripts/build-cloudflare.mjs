// Publica a versao modular sem editar HTML, CSS, JS ou dados.
// A pasta dist/ e a unica enviada ao Cloudflare Workers Static Assets.
import { cp, mkdir, rm, stat, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const files = ['index.html'];
const directories = ['assets', 'css', 'data', 'js'];

for (const file of files) {
  if (!(await stat(path.join(root, file))).isFile()) {
    throw new Error(`Arquivo obrigatorio invalido: ${file}`);
  }
}
for (const directory of directories) {
  if (!(await stat(path.join(root, directory))).isDirectory()) {
    throw new Error(`Diretorio obrigatorio invalido: ${directory}`);
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) {
  await cp(path.join(root, file), path.join(output, file));
}
for (const directory of directories) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}

// Cabecalhos de privacidade; a autorizacao de acesso e gerenciada no
// Cloudflare Zero Trust, nao por este arquivo ou por JavaScript cliente.
await writeFile(path.join(output, '_headers'), [
  '/*',
  '  Cache-Control: private, no-store',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: no-referrer',
  '  X-Robots-Tag: noindex, nofollow, noarchive',
  ''
].join('\n'), 'utf8');

const countFiles = async (dir) => {
  let result = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    result += e.isDirectory() ? await countFiles(path.join(dir, e.name)) : 1;
  }
  return result;
};
const total = await countFiles(output);
console.log(`BRZ SAFRA: ${total} arquivos na pasta dist/ (inclui _headers).`);
console.log('Incluidos: index.html, assets/, css/, data/, js/.');
console.log('Excluidos: docs/, original/, .git/, ferramentas e arquivos de configuracao.');
