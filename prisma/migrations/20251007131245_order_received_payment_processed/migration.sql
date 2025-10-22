/*
  Warnings:

  - The values [ORDER_UPDATE] on the enum `Notification_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Notification` MODIFY `type` ENUM('ORDER_REQUEST', 'ADD_PRODUCT', 'ORDER_RECEIVED', 'PAYMENT_PROCESSED') NULL;
