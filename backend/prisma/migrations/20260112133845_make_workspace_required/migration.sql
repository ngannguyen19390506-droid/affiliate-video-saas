/*
  Warnings:

  - Made the column `workspaceId` on table `VideoProject` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VideoProject" ALTER COLUMN "workspaceId" SET NOT NULL;
