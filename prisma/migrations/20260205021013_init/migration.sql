-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SuperAdmin', 'MedTech', 'Pharmacist_Staff', 'Nurse', 'Manager', 'Cashier');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'DISABLE');

-- CreateEnum
CREATE TYPE "public"."MedTechStatus" AS ENUM ('pending_for_approval', 'approved', 'declined');

-- CreateEnum
CREATE TYPE "public"."MedTechRemarks" AS ENUM ('processing', 'ready', 'released');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('NONE', 'SENIOR', 'PWD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."Remarks" AS ENUM ('preparing', 'prepared', 'dispensed');

-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('REGULAR', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('pending', 'for_payment', 'paid', 'canceled', 'refunded');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('MEDTECH_REQUEST', 'MEDTECH_REQUEST_EDIT', 'MT_REQUEST_READY', 'MT_REQUEST_RELEASED', 'MT_REQUEST_APPROVED', 'MT_REQUEST_DECLINED', 'ORDER_REQUEST', 'ADD_PRODUCT', 'ORDER_RECEIVED', 'PAYMENT_PROCESSED', 'EMERGENCY_ORDER', 'REMARKS', 'WALK_IN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT 'N/A',
    "lastName" TEXT NOT NULL DEFAULT 'N/A',
    "middleName" TEXT,
    "profileImage" TEXT,
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "bannedReason" TEXT,
    "bannedAt" TIMESTAMP(3),
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER,
    "genericName" TEXT,
    "manufacturer" TEXT,
    "description" TEXT,
    "strength" TEXT,
    "dosageForm" TEXT,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(65,30) NOT NULL,
    "minimumStockAlert" DECIMAL(65,30) NOT NULL DEFAULT 6,
    "archivedById" TEXT,
    "archiveAt" TIMESTAMP(3),
    "archiveReason" TEXT,
    "userId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductBatch" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "archiveAt" TIMESTAMP(3),
    "archiveReason" TEXT,
    "archivedById" TEXT,
    "batchNumber" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "manufactureDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedTechRequest" (
    "id" SERIAL NOT NULL,
    "notes" TEXT,
    "status" "public"."MedTechStatus" NOT NULL DEFAULT 'pending_for_approval',
    "remarks" "public"."MedTechRemarks" NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestedById" TEXT NOT NULL,
    "receivedById" TEXT,
    "receivedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "archivedById" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archiveReason" TEXT,

    CONSTRAINT "MedTechRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedTechRequestItem" (
    "id" SERIAL NOT NULL,
    "quantityOrdered" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "medTechRequestId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "MedTechRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patient" (
    "id" TEXT NOT NULL,
    "patientNumber" SERIAL NOT NULL,
    "patientName" TEXT NOT NULL,
    "roomNumber" INTEGER,
    "contactNumber" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "orderRequestId" INTEGER,
    "walkInOrderId" INTEGER,
    "subTotal" DECIMAL(65,30) NOT NULL,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discountPercent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discountType" "public"."DiscountType" NOT NULL DEFAULT 'NONE',
    "vatRate" DECIMAL(65,30) NOT NULL DEFAULT 12,
    "vatAmount" DECIMAL(65,30) NOT NULL,
    "vatExempt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "zeroRated" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amountDue" DECIMAL(65,30) NOT NULL,
    "amountTendered" DECIMAL(65,30) NOT NULL,
    "change" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "processedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Refund" (
    "id" SERIAL NOT NULL,
    "orderRequestId" INTEGER,
    "walkInOrderId" INTEGER,
    "refundAmount" DECIMAL(65,30) NOT NULL,
    "refundReason" TEXT NOT NULL,
    "refundedById" TEXT NOT NULL,
    "refundedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderRequest" (
    "id" SERIAL NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL,
    "remarks" "public"."Remarks" NOT NULL DEFAULT 'preparing',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "type" "public"."OrderType" NOT NULL DEFAULT 'REGULAR',
    "medTechRequestId" INTEGER,
    "archivedById" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archiveReason" TEXT,
    "userId" TEXT NOT NULL,
    "receivedById" TEXT,
    "receivedAt" TIMESTAMP(3),
    "preparedById" TEXT,
    "dispensedById" TEXT,
    "preparedAt" TIMESTAMP(3),
    "dispensedAt" TIMESTAMP(3),

    CONSTRAINT "OrderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" SERIAL NOT NULL,
    "refundedQuantity" DECIMAL(65,30) NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantityOrdered" DECIMAL(65,30) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WalkInTransaction" (
    "id" SERIAL NOT NULL,
    "customer_name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."Status" NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WalkInTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WalkInItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "refundedQuantity" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "productId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "WalkInItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "orderId" INTEGER,
    "walkInOrderId" INTEGER,
    "medTechRequestId" INTEGER,
    "productId" INTEGER,
    "type" "public"."NotificationType",
    "patientName" TEXT,
    "roomNumber" TEXT,
    "submittedBy" TEXT,
    "role" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "public"."ProductCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientNumber_key" ON "public"."Patient"("patientNumber");

-- CreateIndex
CREATE INDEX "Patient_patientName_idx" ON "public"."Patient"("patientName");

-- CreateIndex
CREATE INDEX "Payment_orderRequestId_idx" ON "public"."Payment"("orderRequestId");

-- CreateIndex
CREATE INDEX "Payment_walkInOrderId_idx" ON "public"."Payment"("walkInOrderId");

-- CreateIndex
CREATE INDEX "Refund_orderRequestId_idx" ON "public"."Refund"("orderRequestId");

-- CreateIndex
CREATE INDEX "Refund_walkInOrderId_idx" ON "public"."Refund"("walkInOrderId");

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductBatch" ADD CONSTRAINT "ProductBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductBatch" ADD CONSTRAINT "ProductBatch_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedTechRequest" ADD CONSTRAINT "MedTechRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedTechRequest" ADD CONSTRAINT "MedTechRequest_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedTechRequest" ADD CONSTRAINT "MedTechRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedTechRequest" ADD CONSTRAINT "MedTechRequest_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedTechRequestItem" ADD CONSTRAINT "MedTechRequestItem_medTechRequestId_fkey" FOREIGN KEY ("medTechRequestId") REFERENCES "public"."MedTechRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedTechRequestItem" ADD CONSTRAINT "MedTechRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderRequestId_fkey" FOREIGN KEY ("orderRequestId") REFERENCES "public"."OrderRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_walkInOrderId_fkey" FOREIGN KEY ("walkInOrderId") REFERENCES "public"."WalkInTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Refund" ADD CONSTRAINT "Refund_orderRequestId_fkey" FOREIGN KEY ("orderRequestId") REFERENCES "public"."OrderRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Refund" ADD CONSTRAINT "Refund_walkInOrderId_fkey" FOREIGN KEY ("walkInOrderId") REFERENCES "public"."WalkInTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Refund" ADD CONSTRAINT "Refund_refundedById_fkey" FOREIGN KEY ("refundedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRequest" ADD CONSTRAINT "OrderRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRequest" ADD CONSTRAINT "OrderRequest_medTechRequestId_fkey" FOREIGN KEY ("medTechRequestId") REFERENCES "public"."MedTechRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRequest" ADD CONSTRAINT "OrderRequest_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRequest" ADD CONSTRAINT "OrderRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRequest" ADD CONSTRAINT "OrderRequest_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRequest" ADD CONSTRAINT "OrderRequest_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderRequest" ADD CONSTRAINT "OrderRequest_dispensedById_fkey" FOREIGN KEY ("dispensedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."OrderRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalkInTransaction" ADD CONSTRAINT "WalkInTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalkInItem" ADD CONSTRAINT "WalkInItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalkInItem" ADD CONSTRAINT "WalkInItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."WalkInTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."OrderRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_walkInOrderId_fkey" FOREIGN KEY ("walkInOrderId") REFERENCES "public"."WalkInTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_medTechRequestId_fkey" FOREIGN KEY ("medTechRequestId") REFERENCES "public"."MedTechRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
