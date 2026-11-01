import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = path.join(root, 'src/shared/api/schema.d.ts')

const header = `/**
 * Diese Datei wird aus contracts/openapi.yaml generiert.
 * Nicht von Hand ändern – stattdessen \`npm run gen:api\` ausführen.
 */

`

const content = await readFile(target, 'utf8')

if (!content.startsWith(header)) {
  await writeFile(target, header + content)
}
