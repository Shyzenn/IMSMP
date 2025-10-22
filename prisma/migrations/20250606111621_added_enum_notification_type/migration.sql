-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `orderId` INTEGER NULL,
    ADD COLUMN `productId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `OrderRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
