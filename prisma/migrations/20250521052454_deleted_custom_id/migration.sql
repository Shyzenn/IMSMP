/*
  Warnings:

  - You are about to drop the column `customId` on the `orderrequest` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `OrderRequest_customId_key` ON `OrderRequest`;

-- AlterTable
ALTER TABLE `OrderRequest` DROP COLUMN `customId`;
