-- AlterTable
ALTER TABLE `Product` ADD COLUMN `archiveAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `ProductBatch` ADD COLUMN `archiveAt` DATETIME(3) NULL;
