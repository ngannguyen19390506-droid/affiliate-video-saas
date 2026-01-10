/*
  Warnings:

  - Added the required column `productId` to the `VideoProject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoProject" ADD COLUMN     "productId" TEXT NOT NULL;
