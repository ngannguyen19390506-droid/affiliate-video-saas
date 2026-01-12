/*
  Warnings:

  - Made the column `productId` on table `DailyAction` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `platform` to the `VideoProject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template` to the `VideoProject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VideoProject` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VideoProjectStatus" AS ENUM ('DRAFT', 'GENERATED', 'RENDERING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "VideoPlatform" AS ENUM ('TIKTOK', 'FACEBOOK');

-- AlterTable
ALTER TABLE "DailyAction" ALTER COLUMN "productId" SET NOT NULL;

-- AlterTable
ALTER TABLE "VideoProject" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "outputVideo" TEXT,
ADD COLUMN     "platform" "VideoPlatform" NOT NULL,
ADD COLUMN     "status" "VideoProjectStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "template" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userPrompt" TEXT,
ADD COLUMN     "voiceScript" JSONB;

-- AddForeignKey
ALTER TABLE "DailyAction" ADD CONSTRAINT "DailyAction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
