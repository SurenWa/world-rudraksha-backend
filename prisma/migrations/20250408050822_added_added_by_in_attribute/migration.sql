/*
  Warnings:

  - Added the required column `addedBy` to the `Attribute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "addedBy" TEXT NOT NULL;
