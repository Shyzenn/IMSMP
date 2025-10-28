/*
  Warnings:

  - You are about to drop the column `Role` on the `User` table. All the data in the column will be lost.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User`
ADD COLUMN `role` ENUM('SuperAdmin', 'Pharmacist_Staff', 'Nurse', 'Manager', 'Cashier') NULL;

UPDATE `User` SET `role` = 'SuperAdmin' WHERE `email` = 'manager@email.com';

ALTER TABLE `User`
MODIFY `role` ENUM('SuperAdmin', 'Pharmacist_Staff', 'Nurse', 'Manager', 'Cashier') NOT NULL;

