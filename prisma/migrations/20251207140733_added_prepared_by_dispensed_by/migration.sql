-- AlterTable
ALTER TABLE `orderrequest` ADD COLUMN `DispensedById` VARCHAR(191) NULL,
    ADD COLUMN `PreparedById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_PreparedById_fkey` FOREIGN KEY (`PreparedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_DispensedById_fkey` FOREIGN KEY (`DispensedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
