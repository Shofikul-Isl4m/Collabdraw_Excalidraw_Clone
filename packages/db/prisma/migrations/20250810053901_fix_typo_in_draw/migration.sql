/*
  Warnings:

  - You are about to drop the column `StartY` on the `Draw` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Draw" DROP COLUMN "StartY",
ADD COLUMN     "startY" INTEGER;
