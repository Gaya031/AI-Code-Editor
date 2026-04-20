import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../..');
const localDir = path.join(workspaceRoot, '.local');
const dataDir = path.join(localDir, 'postgres-data');
const logFile = path.join(localDir, 'postgres.log');
const databaseName = 'proj_sart';
const host = 'localhost';
const port = '5432';
const pgBin = process.env.PG_BIN || '/Library/PostgreSQL/18/bin';

function bin(name) {
  const fullPath = path.join(pgBin, name);
  return fs.existsSync(fullPath) ? fullPath : name;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    stdio: options.capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
    ...options
  });
}

function commandSucceeds(command, args) {
  try {
    run(command, args, { capture: true });
    return true;
  } catch {
    return false;
  }
}

fs.mkdirSync(localDir, { recursive: true });

if (!fs.existsSync(path.join(dataDir, 'PG_VERSION'))) {
  run(bin('initdb'), ['-D', dataDir, '--auth=trust', '--encoding=UTF8', '--locale=C']);
}

if (!commandSucceeds(bin('pg_isready'), ['-h', host, '-p', port])) {
  run(bin('pg_ctl'), ['-D', dataDir, '-l', logFile, '-o', `-p ${port}`, 'start']);
}

const exists = run(
  bin('psql'),
  ['-h', host, '-p', port, '-d', 'postgres', '-tAc', `SELECT 1 FROM pg_database WHERE datname='${databaseName}'`],
  { capture: true }
).trim();

if (exists !== '1') {
  run(bin('createdb'), ['-h', host, '-p', port, databaseName]);
}

console.log(`PostgreSQL is ready at postgresql://${host}:${port}/${databaseName}`);

