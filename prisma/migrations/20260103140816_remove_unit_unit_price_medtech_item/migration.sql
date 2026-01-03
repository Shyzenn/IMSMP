/*
  Warnings:

  - You are about to drop the column `unit` on the `medtechrequestitem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `medtechrequestitem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `medtechrequestitem` DROP COLUMN `unit`,
    DROP COLUMN `unitPrice`;
