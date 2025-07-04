/*
  Warnings:

  - The `anordning` column on the `Row` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Row" DROP COLUMN "anordning",
ADD COLUMN     "anordning" TEXT[];
