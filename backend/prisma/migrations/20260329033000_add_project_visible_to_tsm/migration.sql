-- Add visibility toggle so HTSM can decide which projects appear for TSM users.
ALTER TABLE "Project"
ADD COLUMN "visibleToTsm" BOOLEAN NOT NULL DEFAULT false;
