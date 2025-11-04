-- AlterTable
ALTER TABLE `OrderRequest` ADD COLUMN `archivedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `archivedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ProductBatch` ADD COLUMN `archivedById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_archivedById_fkey` FOREIGN KEY (`archivedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductBatch` ADD CONSTRAINT `ProductBatch_archivedById_fkey` FOREIGN KEY (`archivedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_archivedById_fkey` FOREIGN KEY (`archivedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
