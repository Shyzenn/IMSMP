/*
  Warnings:

  - Added the required column `currentUnitsAvailable` to the `ProductBatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `hasOuterPackaging` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `packagesPerBox` DECIMAL(65, 30) NULL,
    ADD COLUMN `pricePerBox` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `productbatch` ADD COLUMN `currentUnitsAvailable` DECIMAL(65, 30) NOT NULL;
