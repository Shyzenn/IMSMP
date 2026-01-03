-- AlterTable
ALTER TABLE `payment` ADD COLUMN `discountType` ENUM('NONE', 'SENIOR', 'PWD', 'CUSTOM') NOT NULL DEFAULT 'NONE';
