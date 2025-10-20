/*
  Warnings:

  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."RolUsuario" AS ENUM ('ADMIN', 'BARBERO', 'CLIENTE');

-- CreateEnum
CREATE TYPE "public"."CategoriaServicio" AS ENUM ('CORTE', 'BARBA', 'AFEITADO', 'TINTURA', 'TRATAMIENTO', 'COMBO');

-- CreateEnum
CREATE TYPE "public"."EstadoCita" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "public"."EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "public"."MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MERCADOPAGO');

-- CreateEnum
CREATE TYPE "public"."DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "public"."TipoNotificacion" AS ENUM ('CITA_CONFIRMADA', 'CITA_RECORDATORIO', 'CITA_CANCELADA', 'NUEVA_RESENA', 'SISTEMA');

-- DropTable
DROP TABLE "public"."Task";

-- DropEnum
DROP TYPE "public"."Priority";

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "public"."RolUsuario" NOT NULL DEFAULT 'CLIENTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clientes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "direccion" TEXT,
    "notas" TEXT,
    "totalVisitas" INTEGER NOT NULL DEFAULT 0,
    "ultimaVisita" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."barberos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "especialidades" TEXT[],
    "anosExperiencia" INTEGER,
    "biografia" TEXT,
    "imagenPerfil" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barberos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."servicios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" "public"."CategoriaServicio" NOT NULL,
    "precioBase" DECIMAL(65,30) NOT NULL,
    "duracionMinutos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."barbero_servicios" (
    "id" TEXT NOT NULL,
    "barberoId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "precioPersonalizado" DECIMAL(65,30),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barbero_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."citas" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "barberoId" TEXT NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3) NOT NULL,
    "estado" "public"."EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "notasCliente" TEXT,
    "notasInternas" TEXT,
    "montoTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estadoPago" "public"."EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "metodoPago" "public"."MetodoPago",
    "canceladaEn" TIMESTAMP(3),
    "canceladaPor" TEXT,
    "razonCancelacion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cita_servicios" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "duracionMinutos" INTEGER NOT NULL,

    CONSTRAINT "cita_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."horarios_barberos" (
    "id" TEXT NOT NULL,
    "barberoId" TEXT NOT NULL,
    "diaSemana" "public"."DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_barberos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resenas" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "barberoId" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notificaciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "public"."TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_usuarioId_key" ON "public"."clientes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "barberos_usuarioId_key" ON "public"."barberos"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "barbero_servicios_barberoId_servicioId_key" ON "public"."barbero_servicios"("barberoId", "servicioId");

-- CreateIndex
CREATE INDEX "citas_clienteId_horaInicio_idx" ON "public"."citas"("clienteId", "horaInicio");

-- CreateIndex
CREATE INDEX "citas_barberoId_horaInicio_idx" ON "public"."citas"("barberoId", "horaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_barberos_barberoId_diaSemana_key" ON "public"."horarios_barberos"("barberoId", "diaSemana");

-- CreateIndex
CREATE UNIQUE INDEX "resenas_citaId_key" ON "public"."resenas"("citaId");

-- CreateIndex
CREATE INDEX "resenas_barberoId_calificacion_idx" ON "public"."resenas"("barberoId", "calificacion");

-- CreateIndex
CREATE INDEX "notificaciones_usuarioId_leida_idx" ON "public"."notificaciones"("usuarioId", "leida");

-- AddForeignKey
ALTER TABLE "public"."clientes" ADD CONSTRAINT "clientes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barberos" ADD CONSTRAINT "barberos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barbero_servicios" ADD CONSTRAINT "barbero_servicios_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "public"."barberos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barbero_servicios" ADD CONSTRAINT "barbero_servicios_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "public"."servicios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "public"."barberos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cita_servicios" ADD CONSTRAINT "cita_servicios_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "public"."citas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cita_servicios" ADD CONSTRAINT "cita_servicios_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "public"."servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."horarios_barberos" ADD CONSTRAINT "horarios_barberos_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "public"."barberos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resenas" ADD CONSTRAINT "resenas_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "public"."citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resenas" ADD CONSTRAINT "resenas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resenas" ADD CONSTRAINT "resenas_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "public"."barberos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
