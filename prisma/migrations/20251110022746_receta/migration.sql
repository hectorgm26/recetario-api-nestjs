-- CreateTable
CREATE TABLE `receta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `tiempo` VARCHAR(191) NOT NULL,
    `descripcion` LONGTEXT NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `foto` VARCHAR(191) NOT NULL,
    `categoria_id` INTEGER NOT NULL,

    UNIQUE INDEX `receta_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `receta` ADD CONSTRAINT `receta_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
