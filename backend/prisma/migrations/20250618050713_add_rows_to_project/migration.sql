/*
  Warnings:

  - You are about to drop the column `description` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `signal` on the `Section` table. All the data in the column will be lost.
  - Made the column `endDate` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endTime` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `namn` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `plats` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startTime` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telefonnummer` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "description",
ADD COLUMN     "rows" JSONB,
ALTER COLUMN "endDate" SET NOT NULL,
ALTER COLUMN "endTime" SET NOT NULL,
ALTER COLUMN "namn" SET NOT NULL,
ALTER COLUMN "plats" SET NOT NULL,
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "telefonnummer" SET NOT NULL;

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "signal";
