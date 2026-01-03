/*
  Warnings:

  - You are about to alter the column `contactNumber` on the `patient` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `patient` MODIFY `contactNumber` INTEGER NULL;
