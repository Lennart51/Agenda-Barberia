/*
  Warnings:

  - You are about to drop the column `especialidades` on the `barberos` table. All the data in the column will be lost.
  - Added the required column `especialidad` to the `barberos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `barberos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `servicios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."barberos" DROP COLUMN "especialidades",
ADD COLUMN     "especialidad" TEXT NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."servicios" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuarioId_idx" ON "public"."refresh_tokens"("usuarioId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_revocado_idx" ON "public"."refresh_tokens"("token", "revocado");

-- CreateIndex
CREATE INDEX "servicios_userId_idx" ON "public"."servicios"("userId");

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."servicios" ADD CONSTRAINT "servicios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
