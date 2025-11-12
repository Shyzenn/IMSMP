-- AlterTable
ALTER TABLE `OrderRequest` ADD COLUMN `refundReason` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `WalkInTransaction` ADD COLUMN `refundReason` VARCHAR(191) NULL;
