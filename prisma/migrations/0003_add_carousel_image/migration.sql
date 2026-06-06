-- CreateTable
CREATE TABLE "CarouselImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarouselImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarouselImage_order_idx" ON "CarouselImage"("order");
