-- CreateTable
CREATE TABLE "DailyActionRun" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "run_date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "DailyActionRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyActionRun_workspace_id_run_date_key" ON "DailyActionRun"("workspace_id", "run_date");
