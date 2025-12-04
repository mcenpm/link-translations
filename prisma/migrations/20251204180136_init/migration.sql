-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER', 'LINGUIST', 'MANAGER');

-- CreateEnum
CREATE TYPE "LanguageLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE', 'BILINGUAL');

-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('TRANSLATION', 'INTERPRETATION', 'BOTH');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED', 'INVOICED', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "billingAddress" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingZip" TEXT,
    "billingCountry" TEXT,
    "shippingAddress" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingZip" TEXT,
    "shippingCountry" TEXT,
    "taxId" TEXT,
    "paymentTerms" TEXT,
    "creditLimit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerContact" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguagePair" (
    "id" TEXT NOT NULL,
    "sourceLanguageId" TEXT NOT NULL,
    "targetLanguageId" TEXT NOT NULL,
    "ratePerWord" DOUBLE PRECISION NOT NULL,
    "minimumCharge" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguagePair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Linguist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "bio" TEXT,
    "experience" INTEGER,
    "specializations" TEXT,
    "education" TEXT,
    "certifications" TEXT,
    "defaultRatePerWord" DOUBLE PRECISION,
    "defaultMinimumCharge" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" TIMESTAMP(3),
    "portfolioUrl" TEXT,
    "portfolioItems" TEXT,
    "totalQuotesCompleted" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Linguist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinguistLanguage" (
    "id" TEXT NOT NULL,
    "linguistId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "level" "LanguageLevel" NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "ratePerWord" DOUBLE PRECISION,
    "minimumCharge" DOUBLE PRECISION,
    "yearsOfExperience" INTEGER,
    "certifications" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinguistLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "languagePairId" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "sourceLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "wordCount" DOUBLE PRECISION,
    "unitOfIssue" TEXT,
    "ratePerUnit" DOUBLE PRECISION NOT NULL,
    "minimumCharge" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION,
    "tax" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "requestedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "quoteId" TEXT,
    "linguistId" TEXT NOT NULL,
    "languagePairId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION,
    "total" DOUBLE PRECISION NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "transactionId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "CustomerContact_customerId_idx" ON "CustomerContact"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE INDEX "Language_code_idx" ON "Language"("code");

-- CreateIndex
CREATE INDEX "LanguagePair_sourceLanguageId_targetLanguageId_idx" ON "LanguagePair"("sourceLanguageId", "targetLanguageId");

-- CreateIndex
CREATE UNIQUE INDEX "LanguagePair_sourceLanguageId_targetLanguageId_key" ON "LanguagePair"("sourceLanguageId", "targetLanguageId");

-- CreateIndex
CREATE UNIQUE INDEX "Linguist_userId_key" ON "Linguist"("userId");

-- CreateIndex
CREATE INDEX "Linguist_state_idx" ON "Linguist"("state");

-- CreateIndex
CREATE INDEX "Linguist_isActive_idx" ON "Linguist"("isActive");

-- CreateIndex
CREATE INDEX "Linguist_isVerified_idx" ON "Linguist"("isVerified");

-- CreateIndex
CREATE INDEX "LinguistLanguage_linguistId_idx" ON "LinguistLanguage"("linguistId");

-- CreateIndex
CREATE INDEX "LinguistLanguage_languageId_idx" ON "LinguistLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "LinguistLanguage_linguistId_languageId_key" ON "LinguistLanguage"("linguistId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_slug_key" ON "State"("slug");

-- CreateIndex
CREATE INDEX "State_code_idx" ON "State"("code");

-- CreateIndex
CREATE INDEX "State_slug_idx" ON "State"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE INDEX "Quote_customerId_idx" ON "Quote"("customerId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_quoteNumber_idx" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Assignment_orderId_idx" ON "Assignment"("orderId");

-- CreateIndex
CREATE INDEX "Assignment_linguistId_idx" ON "Assignment"("linguistId");

-- CreateIndex
CREATE INDEX "Assignment_status_idx" ON "Assignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_orderId_linguistId_key" ON "Assignment"("orderId", "linguistId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerContact" ADD CONSTRAINT "CustomerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguagePair" ADD CONSTRAINT "LanguagePair_sourceLanguageId_fkey" FOREIGN KEY ("sourceLanguageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguagePair" ADD CONSTRAINT "LanguagePair_targetLanguageId_fkey" FOREIGN KEY ("targetLanguageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Linguist" ADD CONSTRAINT "Linguist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinguistLanguage" ADD CONSTRAINT "LinguistLanguage_linguistId_fkey" FOREIGN KEY ("linguistId") REFERENCES "Linguist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinguistLanguage" ADD CONSTRAINT "LinguistLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_languagePairId_fkey" FOREIGN KEY ("languagePairId") REFERENCES "LanguagePair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_linguistId_fkey" FOREIGN KEY ("linguistId") REFERENCES "Linguist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_languagePairId_fkey" FOREIGN KEY ("languagePairId") REFERENCES "LanguagePair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
