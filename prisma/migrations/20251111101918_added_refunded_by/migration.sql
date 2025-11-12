-- AlterTable
ALTER TABLE `OrderRequest` ADD COLUMN `refundedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `WalkInTransaction` ADD COLUMN `refundedById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_refundedById_fkey` FOREIGN KEY (`refundedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WalkInTransaction` ADD CONSTRAINT `WalkInTransaction_refundedById_fkey` FOREIGN KEY (`refundedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
