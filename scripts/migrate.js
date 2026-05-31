const { spawnSync } = require('child_process');

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'pipe', shell: true });
  const out = (r.stdout || '').toString();
  const err = (r.stderr || '').toString();
  return { status: r.status, stdout: out, stderr: err, all: out + err };
}

const result = run('npx', ['prisma', 'migrate', 'deploy']);

// Print output so user sees what happened
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.status === 0) process.exit(0);

if (result.all.includes('P1001')) {
  console.warn('\n⚠ Base de datos no disponible, migraciones omitidas\n');
  process.exit(0);
}

if (result.all.includes('P3005')) {
  console.warn('\n⚠ Base existente sin historial de migraciones. Aplicando baseline...\n');
  const baseline = run('npx', ['prisma', 'migrate', 'resolve', '--applied', '0000_init']);
  if (baseline.status !== 0) {
    console.error('✖ Error al marcar baseline:');
    if (baseline.stderr) process.stderr.write(baseline.stderr);
    process.exit(1);
  }
  console.warn('✓ Baseline aplicado. Reintentando migraciones...\n');
  const retry = run('npx', ['prisma', 'migrate', 'deploy']);
  if (retry.stdout) process.stdout.write(retry.stdout);
  if (retry.stderr) process.stderr.write(retry.stderr);
  process.exit(retry.status || 0);
}

console.error('✖ Error en migraciones');
process.exit(result.status || 1);
