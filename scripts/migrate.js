const { execSync } = require('child_process');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} catch (e) {
  const msg = e.stderr?.toString() || e.stdout?.toString() || e.message;
  if (msg.includes('P1001')) {
    console.warn('\n⚠ Base de datos no disponible, migraciones omitidas\n');
    process.exit(0);
  }
  console.error('\n✖ Error en migraciones:\n', msg);
  process.exit(1);
}
