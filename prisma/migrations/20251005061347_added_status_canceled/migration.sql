-- AlterTable
ALTER TABLE `OrderRequest` MODIFY `status` ENUM('pending', 'for_payment', 'paid', 'canceled') NOT NULL;

-- AlterTable
ALTER TABLE `WalkInTransaction` MODIFY `status` ENUM('pending', 'for_payment', 'paid', 'canceled') NOT NULL;