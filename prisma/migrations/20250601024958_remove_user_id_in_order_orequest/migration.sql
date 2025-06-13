/*
  Warnings:

  - You are about to drop the column `userId` on the `orderrequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orderrequest` DROP FOREIGN KEY `OrderRequest_userId_fkey`;

-- DropIndex
DROP INDEX `OrderRequest_userId_fkey` ON `orderrequest`;

-- AlterTable
ALTER TABLE `orderrequest` DROP COLUMN `userId`;
