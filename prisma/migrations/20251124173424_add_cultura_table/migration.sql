/*
  Warnings:

  - You are about to drop the column `pragasIds` on the `culturas` table. All the data in the column will be lost.
  - You are about to drop the column `pragasNomes` on the `culturas` table. All the data in the column will be lost.
  - You are about to drop the column `unidadeMedida` on the `culturas` table. All the data in the column will be lost.
  - Added the required column `usuarioId` to the `culturas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."culturas" DROP CONSTRAINT "culturas_propriedadeId_fkey";

-- AlterTable
ALTER TABLE "culturas" DROP COLUMN "pragasIds",
DROP COLUMN "pragasNomes",
DROP COLUMN "unidadeMedida",
ADD COLUMN     "pragasConhecidas" TEXT,
ADD COLUMN     "usuarioId" TEXT NOT NULL,
ALTER COLUMN "propriedadeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "culturas" ADD CONSTRAINT "culturas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "culturas" ADD CONSTRAINT "culturas_propriedadeId_fkey" FOREIGN KEY ("propriedadeId") REFERENCES "propriedades"("id") ON DELETE SET NULL ON UPDATE CASCADE;
