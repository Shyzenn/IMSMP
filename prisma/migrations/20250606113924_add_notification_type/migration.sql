-- AlterTable
ALTER TABLE `notification` ADD COLUMN `type` ENUM('ORDER_REQUEST', 'ADD_PRODUCT') NULL;
