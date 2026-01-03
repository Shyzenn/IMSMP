/*
  Warnings:

  - You are about to drop the column `hasOuterPackaging` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerBox` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `hasOuterPackaging`,
    DROP COLUMN `pricePerBox`;
