/*
  Warnings:

  - A unique constraint covering the columns `[customId]` on the table `OrderRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `orderrequest` ADD COLUMN `customId` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `OrderRequest_customId_key` ON `OrderRequest`(`customId`);
