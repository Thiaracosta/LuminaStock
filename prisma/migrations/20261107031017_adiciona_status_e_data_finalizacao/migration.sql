/*
  Warnings:

  - You are about to drop the column `data` on the `Pedido` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('EM_PREPARACAO', 'EM_FABRICACAO', 'EM_ACABAMENTO', 'EMBALANDO', 'ENTREGUE', 'CANCELADO');

-- AlterTable
ALTER TABLE "Pedido" DROP COLUMN "data",
ADD COLUMN     "dataFinalizacao" TIMESTAMP(3),
ADD COLUMN     "dataPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "StatusPedido" NOT NULL DEFAULT 'EM_PREPARACAO';
