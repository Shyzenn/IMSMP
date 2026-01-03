/*
  Warnings:

  - You are about to drop the `storagerequirement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `storagerequirement` DROP FOREIGN KEY `StorageRequirement_productId_fkey`;

-- DropTable
DROP TABLE `storagerequirement`;
