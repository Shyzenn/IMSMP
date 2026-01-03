/*
  Warnings:

  - You are about to drop the column `processedAt` on the `orderrequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orderrequest` DROP COLUMN `processedAt`;

-- AlterTable
ALTER TABLE `payment` MODIFY `walkInOrderId` INTEGER NULL;
