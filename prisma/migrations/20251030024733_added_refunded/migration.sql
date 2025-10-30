-- AlterTable
ALTER TABLE `OrderRequest` ADD COLUMN `refundedAt` DATETIME(3) NULL,
    MODIFY `status` ENUM('pending', 'for_payment', 'paid', 'canceled', 'refunded') NOT NULL;

-- AlterTable
ALTER TABLE `WalkInTransaction` ADD COLUMN `refundedAt` DATETIME(3) NULL,
    MODIFY `status` ENUM('pending', 'for_payment', 'paid', 'canceled', 'refunded') NOT NULL;
