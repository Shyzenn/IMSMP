/*
  Warnings:

  - A unique constraint covering the columns `[product_name,strength,dosageForm]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Product_product_name_strength_dosageForm_key` ON `Product`(`product_name`, `strength`, `dosageForm`);
