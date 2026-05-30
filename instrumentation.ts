export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('@/lib/prisma');
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[instrumentation] DB connection OK');
    } catch (e) {
      console.error('[instrumentation] DB connection failed:', e);
    }
  }
}
