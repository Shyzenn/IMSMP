/*
  Warnings:

  - You are about to drop the column `read` on the `orderrequest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `orderrequest` table. All the data in the column will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_recipientId_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderRequest` DROP FOREIGN KEY `OrderRequest_userId_fkey`;

-- DropIndex
DROP INDEX `OrderRequest_userId_fkey` ON `OrderRequest`;

-- AlterTable
ALTER TABLE `OrderRequest` DROP COLUMN `read`,
    DROP COLUMN `userId`;

-- DropTable
DROP TABLE `Notification`;
