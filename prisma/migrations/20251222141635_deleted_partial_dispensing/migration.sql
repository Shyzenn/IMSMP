/*
  Warnings:

  - You are about to drop the column `allowPartialDispensing` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `packageType` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerPackage` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerUnit` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `smallestUnit` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `unitsPerPackage` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `openedPackageExpiryDate` on the `productbatch` table. All the data in the column will be lost.
  - You are about to drop the column `totalPackageReceived` on the `productbatch` table. All the data in the column will be lost.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `allowPartialDispensing`,
    DROP COLUMN `packageType`,
    DROP COLUMN `pricePerPackage`,
    DROP COLUMN `pricePerUnit`,
    DROP COLUMN `smallestUnit`,
    DROP COLUMN `unitsPerPackage`,
    ADD COLUMN `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `productbatch` DROP COLUMN `openedPackageExpiryDate`,
    DROP COLUMN `totalPackageReceived`;
