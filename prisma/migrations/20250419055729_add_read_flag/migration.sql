/*
  Warnings:

  - You are about to drop the column `isRead` on the `notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `notification` DROP COLUMN `isRead`,
    ADD COLUMN `read` BOOLEAN NOT NULL DEFAULT false;
