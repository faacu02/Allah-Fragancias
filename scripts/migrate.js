const { spawnSync } = require('child_process');
const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'pipe',
  shell: true,
});
const stdout = (result.stdout || '').toString();
const stderr = (result.stderr || '').toString();
if (stdout) process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);
if (result.status !== 0) {
  const msg = stdout + stderr;
  if (msg.includes('P1001')) {
    console.warn('\n⚠ Base de datos no disponible, migraciones omitidas\n');
    process.exit(0);
  }
  process.exit(result.status || 1);
}
