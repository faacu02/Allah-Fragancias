import { prisma } from '@/lib/prisma';
import HomeClient from './page-client';

export default async function HomePage() {
  const carouselImages = await prisma.carouselImage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: { id: true, imageUrl: true, title: true, order: true },
  });

  return <HomeClient initialCarouselImages={carouselImages} />;
}
