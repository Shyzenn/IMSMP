/*
  Warnings:

  - You are about to drop the column `discountPercent` on the `payment` table. All the data in the column will be lost.
  - Added the required column `amountDue` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatAmount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `discountAmount` on table `payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `discountPercent`,
    ADD COLUMN `amountDue` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `change` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `subTotal` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `vatAmount` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `vatExempt` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `vatRate` DECIMAL(5, 2) NOT NULL DEFAULT 12,
    ADD COLUMN `zeroRated` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MODIFY `discountAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0;
