-- AlterTable
ALTER TABLE `receta` ADD COLUMN `usuario_id` INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `receta` ADD CONSTRAINT `receta_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
