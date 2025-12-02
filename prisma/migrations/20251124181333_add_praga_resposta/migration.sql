-- CreateTable
CREATE TABLE "pragas_respostas" (
    "id" TEXT NOT NULL,
    "pragaIdExterno" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "propriedadeId" TEXT,
    "jaViu" BOOLEAN NOT NULL DEFAULT false,
    "conhece" BOOLEAN NOT NULL DEFAULT false,
    "naoConhece" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pragas_respostas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pragas_respostas_usuarioId_pragaIdExterno_key" ON "pragas_respostas"("usuarioId", "pragaIdExterno");

-- AddForeignKey
ALTER TABLE "pragas_respostas" ADD CONSTRAINT "pragas_respostas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
