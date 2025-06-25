-- DropForeignKey
ALTER TABLE "Beteckning" DROP CONSTRAINT "Beteckning_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_projectId_fkey";

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beteckning" ADD CONSTRAINT "Beteckning_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
