/*
  Warnings:

  - You are about to drop the column `openedPackageExpiryDate` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `openedPackageExpiryDate`;

-- AlterTable
ALTER TABLE `productbatch` ADD COLUMN `openedPackageExpiryDate` DATETIME(3) NULL;
