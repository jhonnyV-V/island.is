import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { ROOT } from './_common.mjs'
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { ROOT } from "./_common.mjs";

const enableNodeModules = process.env.ENABLE_NODE_MODULES === 'true'
const enableMobileNodeModules =
    process.env.ENABLE_MOBILE_NODE_MODULES === 'true'
const enableGeneratedFiles = process.env.ENABLE_GENERATED_FILES === 'true'
const enableCypress = process.env.ENABLE_CYPRESS === 'true'
const cypressPath = process.env.CYPRESS_PATH
const keys = JSON.parse(process.env.keys)
const YAML_FILE = process.env['YAML_FILE']

const steps = [
    enableNodeModules
        ? generateCacheAction(
            'Cache node_modules',
            'node-modules',
            'node_modules',
            keys['node-modules-key'],
        )
        : null,
    enableMobileNodeModules
        ? generateCacheAction(
            'Cache Mobile node_modules',
            'mobile-node-modules',
            'apps/native/app/node_modules',
            keys['mobile-node-modules-key'],
        )
        : null,
    enableGeneratedFiles
        ? generateCacheAction(
            'Cache Generated Files',
            'generated-files',
            'generated_files.tar.gz',
            keys['generated-files-key'],
        )
        : null,
    enableCypress
        ? generateCacheAction(
            'Cache Cypress',
            'cypress-cache',
            cypressPath,
            keys['cypress-cache-modules-key'],
        )
        : null,
].filter((e) => e != null)

const workflow = {
    ...createHeader('Autogenerated cache workflow', 'Autogenerated'),
    ...createOutputs(steps),
    ...createRuns(steps),
}

console.log(JSON.stringify(workflow, null, 2))

if (YAML_FILE) {
    const YAML_FILE_ROOT = dirname(YAML_FILE);
    await mkdir(YAML_FILE_ROOT, { recursive: true });
    await exportToYaml(workflow, YAML_FILE)
}

function createHeader(name, description) {
    return {
        name,
        description,
    }
}

function createOutputs(steps) {
    return {
        outputs: steps.reduce((a, value) => {
            return {
                ...a,
                [`${value.id}-success`]: {
                    description: `Success for ${value.name}`,
                    value: `\${{ steps.${value.id}.outputs.success }}`,
                },
            }
        }, {}),
    }
}

function createRuns(steps) {
    return {
        runs: {
            using: 'composite',
            steps: steps.map((_value) => {
                const { name, id, uses, with: withValue, value } = _value
                return {
                    name,
                    id,
                    uses,
                    ...value,
                    with: withValue,
                }
            }),
        },
    }
}

function generateCacheAction(name, id, path, key) {
    return {
        name,
        id,
        uses: './.github/actions/cache',
        continue_on_error: true,
        with: {
            path,
            key,
        },
    }
}

function exportToYaml(obj, _fileName, fileName = resolve(ROOT, _fileName)) {
    return new Promise((resolve) => {
        const jsonString = JSON.stringify(obj)
        const cueProcess = spawn('cue', ['export', '-', '-o', fileName])
        cueProcess.stdin.write(jsonString)
        cueProcess.on('message', (msg) => {
            console.log(msg)
        })
        cueProcess.on('error', (msg) => {
            console.log(msg)
        })
        cueProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`cue export failed with code ${code}`)
                process.exit(1)
            }
            resolve()
        })
        cueProcess.stdin.end()
    })
}
