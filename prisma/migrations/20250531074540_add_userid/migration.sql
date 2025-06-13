/*
  Warnings:

  - Made the column `userId` on table `orderrequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `orderrequest` DROP FOREIGN KEY `OrderRequest_userId_fkey`;

-- DropIndex
DROP INDEX `OrderRequest_userId_fkey` ON `orderrequest`;

-- AlterTable
ALTER TABLE `orderrequest` MODIFY `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
