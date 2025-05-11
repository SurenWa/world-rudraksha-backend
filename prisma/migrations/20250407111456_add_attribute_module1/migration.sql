/*
  Warnings:

  - Added the required column `description` to the `AttributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttributeValue" ADD COLUMN     "description" TEXT NOT NULL;
