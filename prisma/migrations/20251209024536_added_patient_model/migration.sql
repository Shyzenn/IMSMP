/*
  Warnings:

  - You are about to drop the column `patient_name` on the `orderrequest` table. All the data in the column will be lost.
  - You are about to drop the column `room_number` on the `orderrequest` table. All the data in the column will be lost.
  - Added the required column `patientId` to the `OrderRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orderrequest` DROP COLUMN `patient_name`,
    DROP COLUMN `room_number`,
    ADD COLUMN `patientId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Patient` (
    `id` VARCHAR(191) NOT NULL,
    `patientNumber` INTEGER NOT NULL AUTO_INCREMENT,
    `patientName` VARCHAR(191) NOT NULL,
    `roomNumber` INTEGER NULL,
    `contactNumber` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Patient_patientNumber_key`(`patientNumber`),
    INDEX `Patient_patientName_idx`(`patientName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
