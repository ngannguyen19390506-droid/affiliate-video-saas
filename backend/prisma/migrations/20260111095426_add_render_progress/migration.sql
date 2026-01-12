-- CreateEnum
CREATE TYPE "RenderStep" AS ENUM ('ANALYZING', 'SCRIPTING', 'TTS', 'RENDERING', 'DONE', 'ERROR');

-- AlterTable
ALTER TABLE "VideoProject" ADD COLUMN     "renderLogs" JSONB,
ADD COLUMN     "renderProgress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "renderStep" "RenderStep";
