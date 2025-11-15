/*
  Warnings:

  - The values [MEDTECTH_REQUEST] on the enum `Notification_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Notification` MODIFY `type` ENUM('MEDTECH_REQUEST', 'ORDER_REQUEST', 'ADD_PRODUCT', 'ORDER_RECEIVED', 'PAYMENT_PROCESSED', 'EMERGENCY_ORDER', 'REMARKS', 'WALK_IN') NULL;
