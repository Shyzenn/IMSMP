-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `walkInOrderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_walkInOrderId_fkey` FOREIGN KEY (`walkInOrderId`) REFERENCES `WalkInTransaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
