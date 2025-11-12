-- AlterTable
ALTER TABLE `OrderRequest` ADD COLUMN `archiveReason` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `archiveReason` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ProductBatch` ADD COLUMN `archiveReason` VARCHAR(191) NULL;
