/*
  Warnings:

  - You are about to drop the column `unit` on the `orderitem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `orderitem` table. All the data in the column will be lost.
  - Added the required column `price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `unit`,
    DROP COLUMN `unitPrice`,
    ADD COLUMN `price` DECIMAL(10, 2) NOT NULL;
