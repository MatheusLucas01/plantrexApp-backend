-- AlterTable
ALTER TABLE "propriedades" ADD COLUMN     "limitacaoAcessoInsumos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoAgua" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoDoencas" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoEstrada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoImpostos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoMaoDeObra" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoMaquinario" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoPragas" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoRecursosFinanceiros" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoSolo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitacaoTransporte" BOOLEAN NOT NULL DEFAULT false;
