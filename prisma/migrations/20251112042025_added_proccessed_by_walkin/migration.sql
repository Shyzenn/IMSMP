-- AlterTable
ALTER TABLE `WalkInTransaction` ADD COLUMN `processedById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `WalkInTransaction` ADD CONSTRAINT `WalkInTransaction_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
