-- AlterTable
ALTER TABLE `OrderRequest` ADD COLUMN `remarks` ENUM('preparing', 'prepared', 'dispensed') NOT NULL DEFAULT 'preparing';
