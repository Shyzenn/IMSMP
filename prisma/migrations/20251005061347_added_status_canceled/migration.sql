-- AlterTable
ALTER TABLE `orderrequest` MODIFY `status` ENUM('pending', 'for_payment', 'paid', 'canceled') NOT NULL;

-- AlterTable
ALTER TABLE `walkintransaction` MODIFY `status` ENUM('pending', 'for_payment', 'paid', 'canceled') NOT NULL;
