-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('OK', 'LOW');
CREATE TYPE "UserRole" AS ENUM ('admin', 'cliente');
CREATE TYPE "PaymentMethod" AS ENUM ('efectivo', 'transferencia');
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'approved', 'cancelled');

-- Fix any legacy values before altering column types
UPDATE "Order" SET "paymentMethod" = 'transferencia' WHERE "paymentMethod" NOT IN ('efectivo', 'transferencia');

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "status" TYPE "ProductStatus" USING "status"::text::"ProductStatus";
ALTER TABLE "Product" ALTER COLUMN "status" SET DEFAULT 'OK';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::text::"UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'cliente';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod" USING "paymentMethod"::text::"PaymentMethod";
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING "status"::text::"OrderStatus";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'pending';
