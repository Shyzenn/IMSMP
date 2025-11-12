-- AlterTable
ALTER TABLE `User` ADD COLUMN `bannedAt` DATETIME(3) NULL,
    ADD COLUMN `bannedReason` VARCHAR(191) NULL;
