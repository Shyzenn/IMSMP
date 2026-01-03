/*
  Warnings:

  - You are about to drop the column `DispensedById` on the `orderrequest` table. All the data in the column will be lost.
  - You are about to drop the column `PreparedById` on the `orderrequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orderrequest` DROP FOREIGN KEY `OrderRequest_DispensedById_fkey`;

-- DropForeignKey
ALTER TABLE `orderrequest` DROP FOREIGN KEY `OrderRequest_PreparedById_fkey`;

-- DropIndex
DROP INDEX `OrderRequest_DispensedById_fkey` ON `orderrequest`;

-- DropIndex
DROP INDEX `OrderRequest_PreparedById_fkey` ON `orderrequest`;

-- AlterTable
ALTER TABLE `orderrequest` DROP COLUMN `DispensedById`,
    DROP COLUMN `PreparedById`,
    ADD COLUMN `dispensedById` VARCHAR(191) NULL,
    ADD COLUMN `preparedById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_preparedById_fkey` FOREIGN KEY (`preparedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_dispensedById_fkey` FOREIGN KEY (`dispensedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
