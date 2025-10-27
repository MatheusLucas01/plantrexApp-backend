-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "estadoCivil" TEXT,
    "conheceIFGoiano" BOOLEAN NOT NULL DEFAULT false,
    "conheceCursosTecnicos" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propriedades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "coordenadas" TEXT,
    "tamanho" DOUBLE PRECISION NOT NULL,
    "unidadeMedida" TEXT NOT NULL DEFAULT 'HECTARE',
    "soloArenoso" BOOLEAN NOT NULL DEFAULT false,
    "soloArgiloso" BOOLEAN NOT NULL DEFAULT false,
    "soloComCascalhos" BOOLEAN NOT NULL DEFAULT false,
    "soloComPedras" BOOLEAN NOT NULL DEFAULT false,
    "soloDeVarzea" BOOLEAN NOT NULL DEFAULT false,
    "soloPlano" BOOLEAN NOT NULL DEFAULT false,
    "soloDeclivModerada" BOOLEAN NOT NULL DEFAULT false,
    "soloDeclivAcentuada" BOOLEAN NOT NULL DEFAULT false,
    "soloRaso" BOOLEAN NOT NULL DEFAULT false,
    "soloProfundo" BOOLEAN NOT NULL DEFAULT false,
    "conheceBioinsumos" BOOLEAN NOT NULL DEFAULT false,
    "utilizaBioinsumos" BOOLEAN NOT NULL DEFAULT false,
    "tiposBioinsumos" TEXT[],
    "resultadosBioinsumos" TEXT,
    "expectativasBioinsumos" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propriedades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "culturas" (
    "id" TEXT NOT NULL,
    "tipoCultura" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "unidadeMedida" TEXT NOT NULL DEFAULT 'HECTARE',
    "tipoManejo" TEXT,
    "conhecimento" TEXT,
    "pragasIds" TEXT[],
    "pragasNomes" TEXT[],
    "propriedadeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "culturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- AddForeignKey
ALTER TABLE "propriedades" ADD CONSTRAINT "propriedades_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "culturas" ADD CONSTRAINT "culturas_propriedadeId_fkey" FOREIGN KEY ("propriedadeId") REFERENCES "propriedades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
