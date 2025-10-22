/*
  Warnings:

  - Added the required column `recepientId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `recepientId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_recepientId_fkey` FOREIGN KEY (`recepientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
