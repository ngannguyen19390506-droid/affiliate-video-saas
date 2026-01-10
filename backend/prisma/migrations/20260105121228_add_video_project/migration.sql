-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('SELL', 'BUILD');

-- CreateEnum
CREATE TYPE "RenderStatus" AS ENUM ('PENDING', 'DONE', 'FAIL');

-- CreateTable
CREATE TABLE "VideoProject" (
    "id" TEXT NOT NULL,
    "type" "VideoType" NOT NULL,
    "formatId" TEXT,
    "inputMedia" JSONB NOT NULL,
    "visionData" JSONB,
    "scriptData" JSONB,
    "voicePath" TEXT,
    "caption" TEXT,
    "renderStatus" "RenderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoProject_pkey" PRIMARY KEY ("id")
);
