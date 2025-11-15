-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `medTechRequestId` INTEGER NULL;

-- CreateTable
CREATE TABLE `MedTechRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notes` VARCHAR(191) NULL,
    `status` ENUM('pending_for_approval', 'approved', 'declined') NOT NULL DEFAULT 'pending_for_approval',
    `remarks` ENUM('processing', 'ready', 'released') NOT NULL DEFAULT 'processing',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `requestedById` VARCHAR(191) NOT NULL,
    `receivedById` VARCHAR(191) NULL,
    `receivedAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `archivedById` VARCHAR(191) NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `archiveReason` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedTechRequestItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `medTechRequestId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MedTechRequest` ADD CONSTRAINT `MedTechRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedTechRequest` ADD CONSTRAINT `MedTechRequest_receivedById_fkey` FOREIGN KEY (`receivedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedTechRequest` ADD CONSTRAINT `MedTechRequest_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedTechRequest` ADD CONSTRAINT `MedTechRequest_archivedById_fkey` FOREIGN KEY (`archivedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedTechRequestItem` ADD CONSTRAINT `MedTechRequestItem_medTechRequestId_fkey` FOREIGN KEY (`medTechRequestId`) REFERENCES `MedTechRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedTechRequestItem` ADD CONSTRAINT `MedTechRequestItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_medTechRequestId_fkey` FOREIGN KEY (`medTechRequestId`) REFERENCES `MedTechRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
