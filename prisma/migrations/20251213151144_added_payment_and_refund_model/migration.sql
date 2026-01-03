/*
  Warnings:

  - You are about to drop the column `processedById` on the `orderrequest` table. All the data in the column will be lost.
  - You are about to drop the column `refundReason` on the `orderrequest` table. All the data in the column will be lost.
  - You are about to drop the column `refundedAt` on the `orderrequest` table. All the data in the column will be lost.
  - You are about to drop the column `refundedById` on the `orderrequest` table. All the data in the column will be lost.
  - You are about to drop the column `processedById` on the `walkintransaction` table. All the data in the column will be lost.
  - You are about to drop the column `refundReason` on the `walkintransaction` table. All the data in the column will be lost.
  - You are about to drop the column `refundedAt` on the `walkintransaction` table. All the data in the column will be lost.
  - You are about to drop the column `refundedById` on the `walkintransaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orderrequest` DROP FOREIGN KEY `OrderRequest_processedById_fkey`;

-- DropForeignKey
ALTER TABLE `orderrequest` DROP FOREIGN KEY `OrderRequest_refundedById_fkey`;

-- DropForeignKey
ALTER TABLE `walkintransaction` DROP FOREIGN KEY `WalkInTransaction_processedById_fkey`;

-- DropForeignKey
ALTER TABLE `walkintransaction` DROP FOREIGN KEY `WalkInTransaction_refundedById_fkey`;

-- DropIndex
DROP INDEX `OrderRequest_processedById_fkey` ON `orderrequest`;

-- DropIndex
DROP INDEX `OrderRequest_refundedById_fkey` ON `orderrequest`;

-- DropIndex
DROP INDEX `WalkInTransaction_processedById_fkey` ON `walkintransaction`;

-- DropIndex
DROP INDEX `WalkInTransaction_refundedById_fkey` ON `walkintransaction`;

-- AlterTable
ALTER TABLE `orderrequest` DROP COLUMN `processedById`,
    DROP COLUMN `refundReason`,
    DROP COLUMN `refundedAt`,
    DROP COLUMN `refundedById`;

-- AlterTable
ALTER TABLE `walkintransaction` DROP COLUMN `processedById`,
    DROP COLUMN `refundReason`,
    DROP COLUMN `refundedAt`,
    DROP COLUMN `refundedById`;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `walkInOrderId` INTEGER NOT NULL,
    `amountPaid` DECIMAL(10, 2) NOT NULL,
    `discountPercent` DECIMAL(5, 2) NULL DEFAULT 0,
    `discountAmount` DECIMAL(10, 2) NULL DEFAULT 0,
    `processedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Payment_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Refund` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `walkInOrderId` INTEGER NOT NULL,
    `refundAmount` DECIMAL(10, 2) NOT NULL,
    `refundReason` VARCHAR(191) NOT NULL,
    `refundedById` VARCHAR(191) NOT NULL,
    `refundedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Refund_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `OrderRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_walkInOrderId_fkey` FOREIGN KEY (`walkInOrderId`) REFERENCES `WalkInTransaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `OrderRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_walkInOrderId_fkey` FOREIGN KEY (`walkInOrderId`) REFERENCES `WalkInTransaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_refundedById_fkey` FOREIGN KEY (`refundedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
