/*
  Warnings:

  - You are about to drop the column `minimumStockAlertUnit` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `minimumStockAlertValue` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `minimumStockAlertUnit`,
    DROP COLUMN `minimumStockAlertValue`,
    ADD COLUMN `minimumStockAlert` DECIMAL(65, 30) NOT NULL DEFAULT 6;
