-- CreateEnum
CREATE TYPE "DailyActionType" AS ENUM ('MAKE_MORE_VIDEOS', 'SCALE_FORMAT', 'STOP_PRODUCT', 'RETEST_WITH_NEW_FORMAT');

-- CreateTable
CREATE TABLE "DailyAction" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "productId" TEXT,
    "actionType" "DailyActionType" NOT NULL,
    "priority" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "actionDate" TIMESTAMP(3) NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyAction_workspaceId_actionDate_idx" ON "DailyAction"("workspaceId", "actionDate");
