-- CreateTable
CREATE TABLE "ProfileVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileVisit_userId_createdAt_idx" ON "ProfileVisit"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProfileVisit_sessionId_idx" ON "ProfileVisit"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileVisit_userId_sessionId_key" ON "ProfileVisit"("userId", "sessionId");

-- AddForeignKey
ALTER TABLE "ProfileVisit" ADD CONSTRAINT "ProfileVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
