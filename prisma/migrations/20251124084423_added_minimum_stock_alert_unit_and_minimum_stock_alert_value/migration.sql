-- AlterTable
ALTER TABLE `product` ADD COLUMN `minimumStockAlertUnit` ENUM('COUNT', 'PERCENT', 'ML', 'G', 'MG', 'KG', 'L') NOT NULL DEFAULT 'COUNT',
    ADD COLUMN `minimumStockAlertValue` DOUBLE NOT NULL DEFAULT 6;
