/*
  Warnings:

  - The values [Admin] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_recipientId_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_senderId_fkey`;

-- AlterTable
ALTER TABLE `User` MODIFY `Role` ENUM('Pharmacist_Staff', 'Nurse', 'Manager', 'Cashier') NOT NULL;

-- DropTable
DROP TABLE `Notification`;
