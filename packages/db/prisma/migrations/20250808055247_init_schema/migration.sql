-- CreateEnum
CREATE TYPE "public"."Shape" AS ENUM ('rectangle', 'diamond', 'circle', 'line', 'arrow', 'text', 'freeHand');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "joinCode" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chat" (
    "id" TEXT NOT NULL,
    "serialNumber" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Draw" (
    "id" TEXT NOT NULL,
    "shape" "public"."Shape" NOT NULL,
    "strokeStyle" TEXT NOT NULL,
    "fillStyle" TEXT NOT NULL,
    "lineWidth" TEXT NOT NULL,
    "font" TEXT,
    "fontSize" TEXT,
    "startX" INTEGER,
    "StartY" INTEGER,
    "endX" INTEGER,
    "endY" INTEGER,
    "text" TEXT,
    "points" JSONB,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_participants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_participants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Room_joinCode_key" ON "public"."Room"("joinCode");

-- CreateIndex
CREATE INDEX "_participants_B_index" ON "public"."_participants"("B");

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Draw" ADD CONSTRAINT "Draw_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_participants" ADD CONSTRAINT "_participants_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_participants" ADD CONSTRAINT "_participants_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
