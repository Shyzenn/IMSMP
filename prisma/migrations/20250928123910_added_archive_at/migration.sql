-- AlterTable
ALTER TABLE `product` ADD COLUMN `archiveAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `productbatch` ADD COLUMN `archiveAt` DATETIME(3) NULL;
