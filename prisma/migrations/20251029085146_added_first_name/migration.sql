-- AlterTable
ALTER TABLE `User` ADD COLUMN `firstName` VARCHAR(191) NOT NULL DEFAULT 'N/A',
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL DEFAULT 'N/A',
    MODIFY `role` ENUM('SuperAdmin', 'MedTech', 'Pharmacist_Staff', 'Nurse', 'Manager', 'Cashier') NOT NULL;
