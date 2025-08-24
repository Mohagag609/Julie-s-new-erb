-- CreateTable
CREATE TABLE "public"."BankImport" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "bankName" TEXT,
    "description" TEXT,
    "posted" BOOLEAN NOT NULL DEFAULT false,
    "matchedInstallmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankImport_matchedInstallmentId_key" ON "public"."BankImport"("matchedInstallmentId");

-- AddForeignKey
ALTER TABLE "public"."BankImport" ADD CONSTRAINT "BankImport_matchedInstallmentId_fkey" FOREIGN KEY ("matchedInstallmentId") REFERENCES "public"."Installment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
