/*
  Warnings:

  - You are about to drop the column `quantity` on the `medtechrequestitem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `orderitem` table. All the data in the column will be lost.
  - You are about to alter the column `refundedQuantity` on the `orderitem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - You are about to drop the column `price` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `productbatch` table. All the data in the column will be lost.
  - Added the required column `quantityOrdered` to the `MedTechRequestItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `MedTechRequestItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `MedTechRequestItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `MedTechRequestItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantityOrdered` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `OrderRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerPackage` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerUnit` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smallestUnit` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitsPerPackage` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manufactureDate` to the `ProductBatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalUnitsReceived` to the `ProductBatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medtechrequestitem` DROP COLUMN `quantity`,
    ADD COLUMN `quantityOrdered` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `totalPrice` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `unit` VARCHAR(191) NOT NULL,
    ADD COLUMN `unitPrice` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `notification` MODIFY `type` ENUM('MEDTECH_REQUEST', 'MEDTECH_REQUEST_EDIT', 'MT_REQUEST_READY', 'MT_REQUEST_RELEASED', 'MT_REQUEST_APPROVED', 'MT_REQUEST_DECLINED', 'ORDER_REQUEST', 'ADD_PRODUCT', 'ORDER_RECEIVED', 'PAYMENT_PROCESSED', 'EMERGENCY_ORDER', 'REMARKS', 'WALK_IN') NULL;

-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `quantity`,
    ADD COLUMN `quantityOrdered` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `totalPrice` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `unit` VARCHAR(191) NOT NULL,
    ADD COLUMN `unitPrice` DECIMAL(65, 30) NOT NULL,
    MODIFY `refundedQuantity` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `orderrequest` ADD COLUMN `medTechRequestId` INTEGER NULL,
    ADD COLUMN `totalAmount` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `price`,
    ADD COLUMN `allowPartialDispensing` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `dosageForm` VARCHAR(191) NULL,
    ADD COLUMN `genericName` VARCHAR(191) NULL,
    ADD COLUMN `manufacturer` VARCHAR(191) NULL,
    ADD COLUMN `packageType` VARCHAR(191) NULL,
    ADD COLUMN `pricePerPackage` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `pricePerUnit` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `requiresPrescription` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `smallestUnit` VARCHAR(191) NOT NULL,
    ADD COLUMN `strength` VARCHAR(191) NULL,
    ADD COLUMN `unitsPerPackage` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `productbatch` DROP COLUMN `releaseDate`,
    ADD COLUMN `manufactureDate` DATETIME(3) NOT NULL,
    ADD COLUMN `totalUnitsReceived` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `unitsDispensed` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    ADD COLUMN `unitsWasted` DECIMAL(65, 30) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `StorageRequirement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `temperatureMin` DECIMAL(65, 30) NULL,
    `temperatureMax` DECIMAL(65, 30) NULL,
    `humidityRequirements` VARCHAR(191) NULL,
    `lightProtection` BOOLEAN NOT NULL DEFAULT false,
    `specialInstructions` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StorageRequirement_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StorageRequirement` ADD CONSTRAINT `StorageRequirement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_medTechRequestId_fkey` FOREIGN KEY (`medTechRequestId`) REFERENCES `MedTechRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
