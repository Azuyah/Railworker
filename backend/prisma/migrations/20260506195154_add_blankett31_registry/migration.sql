-- CreateTable
CREATE TABLE "Blankett31Registry" (
    "id" SERIAL NOT NULL,
    "registryKey" TEXT NOT NULL,
    "sourceFileName" TEXT,
    "projectId" INTEGER,
    "projectName" TEXT,
    "projectPlats" TEXT,
    "beteckning" TEXT,
    "planeringsId" TEXT,
    "rawGranspunkt" TEXT,
    "normalizedGranspunkt" TEXT NOT NULL,
    "boundarySignature" TEXT NOT NULL,
    "boundaryStart" TEXT,
    "boundaryEnd" TEXT,
    "boundaryStartCode" TEXT,
    "boundaryEndCode" TEXT,
    "driftplatsCodes" TEXT[],
    "entries" JSONB,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blankett31Registry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blankett31Registry_registryKey_key" ON "Blankett31Registry"("registryKey");

-- CreateIndex
CREATE INDEX "Blankett31Registry_projectId_idx" ON "Blankett31Registry"("projectId");

-- CreateIndex
CREATE INDEX "Blankett31Registry_boundarySignature_idx" ON "Blankett31Registry"("boundarySignature");

-- AddForeignKey
ALTER TABLE "Blankett31Registry" ADD CONSTRAINT "Blankett31Registry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
