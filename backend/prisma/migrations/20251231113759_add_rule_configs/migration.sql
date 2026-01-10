-- CreateTable
CREATE TABLE "RuleConfig" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RuleConfig_workspaceId_idx" ON "RuleConfig"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "RuleConfig_workspaceId_key_key" ON "RuleConfig"("workspaceId", "key");
