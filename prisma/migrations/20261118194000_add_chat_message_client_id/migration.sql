-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "clientId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_sessionId_clientId_key" ON "ChatMessage"("sessionId", "clientId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_id_idx" ON "ChatMessage"("createdAt", "id");
