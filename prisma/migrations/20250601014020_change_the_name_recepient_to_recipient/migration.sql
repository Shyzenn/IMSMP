/*
  Warnings:

  - You are about to drop the column `recepientId` on the `notification` table. All the data in the column will be lost.
  - Added the required column `recipientId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_recepientId_fkey`;

-- DropIndex
DROP INDEX `Notification_recepientId_fkey` ON `notification`;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `recepientId`,
    ADD COLUMN `recipientId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
