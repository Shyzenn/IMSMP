/*
  Warnings:

  - You are about to drop the column `customId` on the `orderrequest` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `OrderRequest_customId_key` ON `orderrequest`;

-- AlterTable
ALTER TABLE `orderrequest` DROP COLUMN `customId`;
