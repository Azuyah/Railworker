/*
  Warnings:

  - Added the required column `type` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "endDate" TEXT,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "namn" TEXT,
ADD COLUMN     "plats" TEXT,
ADD COLUMN     "startDate" TEXT,
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "telefonnummer" TEXT;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "signal" DROP NOT NULL;
