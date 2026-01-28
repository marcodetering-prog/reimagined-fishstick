-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AI', 'TENANT');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('SUCCESS', 'FAILED', 'PROCESSING');

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL,
    "message" TEXT NOT NULL,
    "responseTimeMs" INTEGER,
    "resolved" BOOLEAN,
    "satisfactionScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "satisfactionScore" DOUBLE PRECISION,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPISnapshot" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "avgResponseTimeMs" DOUBLE PRECISION,
    "avgMessageLength" DOUBLE PRECISION,
    "avgResponseQuality" DOUBLE PRECISION,
    "resolutionRate" DOUBLE PRECISION,
    "avgSatisfaction" DOUBLE PRECISION,
    "avgConversationDuration" DOUBLE PRECISION,
    "totalConversations" INTEGER NOT NULL,
    "totalMessages" INTEGER NOT NULL,
    "activeTenants" INTEGER NOT NULL,
    "messagesPerDay" DOUBLE PRECISION,
    "avgTurnsToResolution" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KPISnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadHistory" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "recordsCount" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "UploadStatus" NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "UploadHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatMessage_tenantId_idx" ON "ChatMessage"("tenantId");

-- CreateIndex
CREATE INDEX "ChatMessage_timestamp_idx" ON "ChatMessage"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_conversationId_key" ON "Conversation"("conversationId");

-- CreateIndex
CREATE INDEX "Conversation_tenantId_idx" ON "Conversation"("tenantId");

-- CreateIndex
CREATE INDEX "Conversation_startTime_idx" ON "Conversation"("startTime");

-- CreateIndex
CREATE INDEX "KPISnapshot_startDate_idx" ON "KPISnapshot"("startDate");

-- CreateIndex
CREATE INDEX "KPISnapshot_endDate_idx" ON "KPISnapshot"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "KPISnapshot_startDate_endDate_key" ON "KPISnapshot"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
