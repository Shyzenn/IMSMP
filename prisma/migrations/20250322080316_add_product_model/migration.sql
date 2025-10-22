/*
  Warnings:

  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[product_name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_name` to the `Product` table without a default value. This is not possible if the table is not empty.
*/

-- DropIndex
DROP INDEX `Product_name_key` ON `Product`;

-- AlterTable
ALTER TABLE `Product`
DROP COLUMN `name`,
ADD COLUMN `product_name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Product_product_name_key` ON `Product`(`product_name`);
