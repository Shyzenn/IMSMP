-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `refundedQuantity` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `WalkInItem` ADD COLUMN `refundedQuantity` INTEGER NOT NULL DEFAULT 0;
