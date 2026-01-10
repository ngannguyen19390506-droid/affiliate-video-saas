-- DropIndex
DROP INDEX "DailyAction_workspaceId_actionDate_idx";

-- AlterTable
ALTER TABLE "DailyAction" ADD COLUMN     "doneAt" TIMESTAMP(3);
