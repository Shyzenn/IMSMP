/*
  Warnings:

  - You are about to drop the column `userId` on the `orderrequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrderRequest` DROP FOREIGN KEY `OrderRequest_userId_fkey`;

-- DropIndex
DROP INDEX `OrderRequest_userId_fkey` ON `OrderRequest`;

-- AlterTable
ALTER TABLE `OrderRequest` DROP COLUMN `userId`;
