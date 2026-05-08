/*
  Warnings:

  - The `expiryDate` column on the `GoogleAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "GoogleAccount" DROP COLUMN "expiryDate",
ADD COLUMN     "expiryDate" TIMESTAMP(3);
