/*
  Warnings:

  - Added the required column `status` to the `WalkInTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `walkintransaction` ADD COLUMN `status` ENUM('pending', 'for_payment', 'paid') NOT NULL;
