-- CreateTable
CREATE TABLE "code_chunks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "startLine" INTEGER NOT NULL,
    "endLine" INTEGER NOT NULL,
    "imports" TEXT[],
    "exports" TEXT[],
    "dependencies" TEXT[],

    CONSTRAINT "code_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "code_chunks_projectId_idx" ON "code_chunks"("projectId");

-- CreateIndex
CREATE INDEX "code_chunks_projectId_filePath_idx" ON "code_chunks"("projectId", "filePath");

-- AddForeignKey
ALTER TABLE "code_chunks" ADD CONSTRAINT "code_chunks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
