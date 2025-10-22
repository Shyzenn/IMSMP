/*
  Warnings:

  - You are about to drop the column `expiryDate` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `expiryDate`,
    DROP COLUMN `quantity`,
    DROP COLUMN `releaseDate`;

-- CreateTable
CREATE TABLE `ProductBatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `releaseDate` DATETIME(3) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductBatch` ADD CONSTRAINT `ProductBatch_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
