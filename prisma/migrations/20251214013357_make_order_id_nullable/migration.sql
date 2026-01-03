/*
  Warnings:

  - You are about to drop the column `orderId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `refund` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `refund` DROP FOREIGN KEY `Refund_orderId_fkey`;

-- DropIndex
DROP INDEX `Payment_orderId_idx` ON `payment`;

-- DropIndex
DROP INDEX `Refund_orderId_idx` ON `refund`;

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `orderId`,
    ADD COLUMN `orderRequestId` INTEGER NULL;

-- AlterTable
ALTER TABLE `refund` DROP COLUMN `orderId`,
    ADD COLUMN `orderRequestId` INTEGER NULL,
    MODIFY `walkInOrderId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Payment_orderRequestId_idx` ON `Payment`(`orderRequestId`);

-- CreateIndex
CREATE INDEX `Refund_orderRequestId_idx` ON `Refund`(`orderRequestId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderRequestId_fkey` FOREIGN KEY (`orderRequestId`) REFERENCES `OrderRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_orderRequestId_fkey` FOREIGN KEY (`orderRequestId`) REFERENCES `OrderRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `payment` RENAME INDEX `Payment_walkInOrderId_fkey` TO `Payment_walkInOrderId_idx`;

-- RenameIndex
ALTER TABLE `refund` RENAME INDEX `Refund_walkInOrderId_fkey` TO `Refund_walkInOrderId_idx`;
