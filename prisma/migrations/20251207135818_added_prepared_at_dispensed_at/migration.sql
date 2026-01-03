-- AlterTable
ALTER TABLE `orderrequest` ADD COLUMN `dispensedAt` DATETIME(3) NULL,
    ADD COLUMN `preparedAt` DATETIME(3) NULL;
