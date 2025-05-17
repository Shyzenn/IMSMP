/*
  Warnings:

  - You are about to alter the column `category` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `category` ENUM('ANTIBIOTIC', 'GASTROINTESTINAL', 'PAIN_RELIEVER', 'ANTI_INFLAMMATORY', 'GENERAL_MEDICATION') NOT NULL;
