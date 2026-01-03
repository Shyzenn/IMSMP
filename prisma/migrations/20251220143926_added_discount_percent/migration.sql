/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `payment` table. All the data in the column will be lost.
  - Added the required column `amountTendered` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `amountPaid`,
    ADD COLUMN `amountTendered` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `discountPercent` DECIMAL(5, 2) NOT NULL DEFAULT 0;
