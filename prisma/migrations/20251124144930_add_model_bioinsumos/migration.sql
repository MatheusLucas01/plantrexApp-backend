-- CreateTable
CREATE TABLE "Bioinsumo" (
    "id" TEXT NOT NULL,
    "conheceBioinsumos" BOOLEAN NOT NULL DEFAULT false,
    "utilizaBioinsumos" BOOLEAN NOT NULL DEFAULT false,
    "tiposBioinsumos" TEXT,
    "resultadosBioinsumos" TEXT,
    "expectativasBioinsumos" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bioinsumo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bioinsumo" ADD CONSTRAINT "Bioinsumo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
