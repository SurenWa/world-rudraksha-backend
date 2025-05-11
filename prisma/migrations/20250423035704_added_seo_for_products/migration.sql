-- AlterTable
ALTER TABLE "products" ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "productUrl" TEXT,
ADD COLUMN     "tags" TEXT[];
