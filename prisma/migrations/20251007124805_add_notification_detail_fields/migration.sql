-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `patientName` VARCHAR(191) NULL,
    ADD COLUMN `role` VARCHAR(191) NULL,
    ADD COLUMN `roomNumber` VARCHAR(191) NULL,
    ADD COLUMN `submittedBy` VARCHAR(191) NULL;
