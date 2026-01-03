/*
  Warnings:

  - You are about to drop the column `currentUnitsAvailable` on the `productbatch` table. All the data in the column will be lost.
  - You are about to drop the column `totalUnitsReceived` on the `productbatch` table. All the data in the column will be lost.
  - You are about to drop the column `unitsDispensed` on the `productbatch` table. All the data in the column will be lost.
  - You are about to drop the column `unitsWasted` on the `productbatch` table. All the data in the column will be lost.
  - Added the required column `totalPackageReceived` to the `ProductBatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `productbatch` DROP COLUMN `currentUnitsAvailable`,
    DROP COLUMN `totalUnitsReceived`,
    DROP COLUMN `unitsDispensed`,
    DROP COLUMN `unitsWasted`,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `totalPackageReceived` DECIMAL(65, 30) NOT NULL;
