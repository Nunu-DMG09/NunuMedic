-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-11-2025 a las 06:06:15
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `nunumed`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(10) UNSIGNED NOT NULL,
  `nombre_categoria` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre_categoria`, `descripcion`) VALUES
(1, 'Cuidado de la piel', 'Productos para limpieza, hidratación y tratamiento facial y corporal'),
(2, 'Cuidado del cabello', 'Champús, acondicionadores, tratamientos y styling'),
(3, 'Cuidado adulto', 'Pañales, protectores y productos para el cuidado de adultos'),
(4, 'Medicamentos', 'Medicamentos de venta libre y con receta'),
(5, 'Vitaminas y suplementos', 'Vitaminas, minerales y suplementos nutricionales'),
(6, 'Higiene personal', 'Jabones, desodorantes y artículos de aseo'),
(7, 'Bebés y maternidad', 'Productos para recién nacidos y madres'),
(8, 'Cosmética', 'Maquillaje y artículos cosméticos'),
(9, 'Dermocosmética', 'Productos dermatológicos y para pieles sensibles'),
(10, 'Ortopedia', 'Soportes, fajas y artículos ortopédicos'),
(11, 'Equipo médico', 'Instrumental y equipos médicos básicos'),
(12, 'Aseo bucal', 'Pastas, cepillos y enjuagues bucales'),
(13, 'Perfumería', 'Fragancias y sets de regalo'),
(14, 'Suplementos deportivos', 'Proteínas, recuperadores y complementos para deporte'),
(15, 'Nutrición y dietética', 'Alimentos dietéticos y nutricionales'),
(16, 'Accesorios y cuidado general', 'Accesorios varios y cuidado del hogar'),
(17, 'Cuidado femenino', 'Productos de higiene y cuidado femenino'),
(18, 'Cuidado masculino', 'Afeitado y grooming masculino'),
(19, 'Primera ayuda', 'Vendas, antisépticos y kits de primeros auxilios'),
(20, 'Tratamientos dermatológicos', 'Productos para tratamientos específicos de la piel');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `dni` varchar(8) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `nombre`, `apellido`, `dni`, `telefono`, `direccion`, `email`) VALUES
(1, 'David ', 'Mesta', '72357275', NULL, NULL, NULL),
(2, 'Pedro', 'Cespedes', '60776050', NULL, NULL, NULL),
(3, 'Diego Alberto', 'Castro Pastor', '74887540', NULL, NULL, NULL),
(4, 'Jhosselin Nayheli', 'Gonzales Salazar', '72349859', NULL, NULL, NULL),
(5, 'sadjasd', 'dasjkdhasjda', '72348559', NULL, NULL, NULL),
(6, 'Sarumi Lisvet ', 'Mesta Gonzales', '61261249', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id_detalle` int(10) UNSIGNED NOT NULL,
  `id_venta` int(10) UNSIGNED DEFAULT NULL,
  `id_producto` int(10) UNSIGNED DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_venta`
--

INSERT INTO `detalle_venta` (`id_detalle`, `id_venta`, `id_producto`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 48, 1, 6.50),
(2, 2, 48, 1, 6.50),
(3, 3, 48, 2, 6.50),
(4, 3, 47, 1, 2.50),
(5, 3, 46, 2, 13.00),
(6, 3, 39, 2, 1.50),
(7, 3, 38, 1, 3.50),
(8, 4, 10, 1, 2.00),
(9, 4, 49, 4, 50.00),
(10, 5, 10, 2, 2.00),
(11, 5, 49, 4, 50.00),
(12, 5, 47, 1, 2.50),
(13, 5, 41, 1, 10.00),
(14, 5, 40, 1, 2.20),
(15, 6, 50, 1, 100.00),
(16, 6, 49, 1, 50.00),
(17, 7, 47, 10, 2.50),
(18, 8, 37, 2, 2.50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `knex_migrations`
--

CREATE TABLE `knex_migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `knex_migrations`
--

INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES
(1, '20251023_init_schema.cjs', 1, '2025-10-23 03:32:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `knex_migrations_lock`
--

CREATE TABLE `knex_migrations_lock` (
  `index` int(10) UNSIGNED NOT NULL,
  `is_locked` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `knex_migrations_lock`
--

INSERT INTO `knex_migrations_lock` (`index`, `is_locked`) VALUES
(1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_stock`
--

CREATE TABLE `movimiento_stock` (
  `id_movimiento` int(10) UNSIGNED NOT NULL,
  `id_producto` int(10) UNSIGNED DEFAULT NULL,
  `tipo` enum('entrada','salida') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_movimiento` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimiento_stock`
--

INSERT INTO `movimiento_stock` (`id_movimiento`, `id_producto`, `tipo`, `cantidad`, `descripcion`, `fecha_movimiento`) VALUES
(1, 45, 'entrada', 52, 'Ajuste por edición de producto', '2025-10-23 03:45:12'),
(2, 44, 'entrada', 95, 'Ajuste por edición de producto', '2025-10-23 03:45:25'),
(3, 43, 'entrada', 50, 'Ajuste por edición de producto', '2025-10-23 03:45:42'),
(4, 48, 'salida', 1, 'Venta #1', '2025-10-23 03:46:47'),
(5, 48, 'salida', 1, 'Venta #2', '2025-10-27 00:26:42'),
(6, 48, 'salida', 2, 'Venta #3', '2025-10-29 01:26:56'),
(7, 47, 'salida', 1, 'Venta #3', '2025-10-29 01:26:56'),
(8, 46, 'salida', 2, 'Venta #3', '2025-10-29 01:26:56'),
(9, 39, 'salida', 2, 'Venta #3', '2025-10-29 01:26:56'),
(10, 38, 'salida', 1, 'Venta #3', '2025-10-29 01:26:56'),
(11, 10, 'salida', 1, 'Venta #4', '2025-10-29 05:12:10'),
(12, 49, 'salida', 4, 'Venta #4', '2025-10-29 05:12:10'),
(13, 10, 'salida', 2, 'Venta #5', '2025-10-29 05:22:58'),
(14, 49, 'salida', 4, 'Venta #5', '2025-10-29 05:22:58'),
(15, 47, 'salida', 1, 'Venta #5', '2025-10-29 05:22:58'),
(16, 41, 'salida', 1, 'Venta #5', '2025-10-29 05:22:58'),
(17, 40, 'salida', 1, 'Venta #5', '2025-10-29 05:22:58'),
(18, 49, 'entrada', 8, 'Ajuste por edición de producto', '2025-10-29 05:26:31'),
(19, 50, 'salida', 1, 'Venta #6', '2025-10-30 17:46:03'),
(20, 49, 'salida', 1, 'Venta #6', '2025-10-30 17:46:03'),
(21, 47, 'salida', 10, 'Venta #7', '2025-10-31 22:43:07'),
(22, 37, 'salida', 2, 'Venta #8', '2025-10-31 22:44:47'),
(23, 48, 'entrada', 10, 'Ajuste por edición de producto', '2025-10-31 22:46:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(10) UNSIGNED NOT NULL,
  `nombre_producto` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_categoria` int(10) UNSIGNED DEFAULT NULL,
  `precio_compra` decimal(10,2) NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `stock_minimo` int(11) DEFAULT 5,
  `fecha_vencimiento` date DEFAULT NULL,
  `estado` enum('disponible','agotado','vencimiento') DEFAULT 'disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nombre_producto`, `descripcion`, `id_categoria`, `precio_compra`, `precio_venta`, `stock`, `stock_minimo`, `fecha_vencimiento`, `estado`) VALUES
(1, 'Gel limpiador facial 200ml', 'Gel suave para limpieza diaria', 1, 2.50, 5.00, 50, 5, NULL, 'disponible'),
(2, 'Crema hidratante 50ml', 'Hidratación para piel sensible', 1, 3.20, 7.50, 40, 5, NULL, 'disponible'),
(3, 'Protector solar SPF50 100ml', 'Protector contra rayos UV', 1, 4.00, 9.99, 30, 5, NULL, 'disponible'),
(4, 'Shampoo reparador 400ml', 'Nutre y repara el cabello', 2, 2.00, 6.50, 25, 5, NULL, 'disponible'),
(5, 'Acondicionador nutritivo 400ml', 'Suaviza y desenreda', 2, 1.80, 5.50, 28, 5, NULL, 'disponible'),
(6, 'Tónico capilar 150ml', 'Estimula el cuero cabelludo', 2, 1.50, 4.50, 20, 5, NULL, 'disponible'),
(7, 'Pañales talla M (20u)', 'Pañales absorbentes', 3, 6.00, 12.00, 15, 5, NULL, 'disponible'),
(8, 'Protectores diarios 30u', 'Cuidado diario íntimo', 3, 1.50, 3.50, 60, 10, NULL, 'disponible'),
(9, 'Ibuprofeno 400mg 20 tabs', 'Analgésico', 4, 0.80, 2.50, 100, 10, '2026-08-01', 'disponible'),
(10, 'Paracetamol 500mg 20 tabs', 'Analgésico y antipirético', 4, 0.60, 2.00, 117, 10, '2026-12-01', 'disponible'),
(11, 'Amoxicilina 500mg 12 caps', 'Antibiótico', 4, 1.50, 5.00, 10, 5, '2025-12-31', 'disponible'),
(12, 'Vitamina C 500mg 60 caps', 'Suplemento antioxidante', 5, 2.00, 6.00, 75, 10, '2027-03-01', 'disponible'),
(13, 'Multivitamínico adulto 30 caps', 'Complejo vitamínico diario', 5, 3.50, 9.50, 50, 10, '2027-06-01', 'disponible'),
(14, 'Omega 3 1000mg 30 caps', 'Ácidos grasos esenciales', 5, 4.00, 11.00, 35, 8, '2027-01-15', 'disponible'),
(15, 'Jabón líquido 500ml', 'Jabón corporal nutritivo', 6, 0.80, 2.00, 90, 10, NULL, 'disponible'),
(16, 'Desodorante roll-on 50ml', 'Protección 24h', 6, 0.90, 2.50, 70, 10, NULL, 'disponible'),
(17, 'Leche de fórmula 400g', 'Alimento para bebés', 7, 5.00, 12.50, 20, 5, '2026-05-01', 'disponible'),
(18, 'Toallas húmedas bebé 72u', 'Limpieza suave', 7, 1.20, 3.00, 80, 10, NULL, 'disponible'),
(19, 'Base líquida tono medio 30ml', 'Maquillaje cobertura media', 8, 3.00, 8.00, 25, 5, NULL, 'disponible'),
(20, 'Rímel volumen 10ml', 'Pestañas definidas', 8, 1.50, 4.50, 40, 5, NULL, 'disponible'),
(21, 'Crema dermocosmética 30ml', 'Tratamiento piel sensible', 9, 5.00, 14.00, 18, 5, NULL, 'disponible'),
(22, 'Serum anti-edad 30ml', 'Reducción de arrugas', 9, 6.50, 18.00, 12, 5, NULL, 'disponible'),
(23, 'Rodillera elástica talla M', 'Soporte ortopédico', 10, 8.00, 20.00, 10, 2, NULL, 'disponible'),
(24, 'Termómetro digital', 'Termómetro clínico digital', 11, 4.00, 10.00, 25, 3, NULL, 'disponible'),
(25, 'Pasta dental blanqueante 90ml', 'Higiene bucal diaria', 12, 0.70, 2.00, 100, 10, NULL, 'disponible'),
(26, 'Cepillo dental suave', 'Cepillo de cerdas suaves', 12, 0.30, 1.00, 150, 20, NULL, 'disponible'),
(27, 'Perfume dama 50ml', 'Fragancia floral', 13, 8.00, 22.00, 15, 3, NULL, 'disponible'),
(28, 'Eau de toilette caballero 100ml', 'Aroma fresco', 13, 9.00, 24.00, 12, 3, NULL, 'disponible'),
(29, 'Proteína whey 1kg', 'Suplemento deportivo', 14, 12.00, 30.00, 20, 5, '2026-11-01', 'disponible'),
(30, 'Barras energéticas 12u', 'Snacks para deportistas', 14, 6.00, 14.00, 40, 8, '2026-02-01', 'disponible'),
(31, 'Harina de avena 500g', 'Alimento dietético', 15, 1.00, 2.50, 60, 10, '2027-09-01', 'disponible'),
(32, 'Suplemento proteico vegetal 250g', 'Alternativa vegana', 15, 4.50, 11.00, 22, 5, '2026-09-01', 'disponible'),
(33, 'Esponja de baño', 'Accesorio de baño', 16, 0.30, 1.00, 120, 15, NULL, 'disponible'),
(34, 'Cortaúñas acero', 'Accesorio de cuidado personal', 16, 0.20, 0.80, 200, 20, NULL, 'disponible'),
(35, 'Compresas noche 14u', 'Cuidado femenino', 17, 0.90, 2.50, 85, 10, NULL, 'disponible'),
(36, 'Toallas íntimas 20u', 'Cuidado femenino diario', 17, 0.80, 2.00, 95, 10, NULL, 'disponible'),
(37, 'Crema de afeitar 150ml', 'Afeitado suave', 18, 0.90, 2.50, 58, 8, NULL, 'disponible'),
(38, 'Aftershave 100ml', 'Cuidado post-afeitado', 18, 1.20, 3.50, 29, 5, NULL, 'disponible'),
(39, 'Vendas estériles 5x5 10u', 'Primera ayuda básica', 19, 0.50, 1.50, 138, 20, NULL, 'disponible'),
(40, 'Alcohol 70% 500ml', 'Antiséptico', 19, 0.80, 2.20, 89, 15, NULL, 'disponible'),
(41, 'Crema antiacné 30ml', 'Tratamiento dermatológico', 20, 4.00, 10.00, 13, 5, NULL, 'disponible'),
(42, 'Ampolla reparadora 10ml', 'Tratamiento intensivo', 20, 2.20, 6.00, 9, 5, NULL, 'disponible'),
(43, 'Pastillas para la tos 24u', 'Alivio de la tos', 4, 0.70, 2.20, 50, 5, '2025-11-20', 'disponible'),
(44, 'Ungüento analgésico 30g', 'Uso tópico para dolor', 4, 1.20, 3.50, 100, 5, '2025-10-22', 'disponible'),
(45, 'Vitamina D 1000UI 60 caps', 'Suplemento esencial', 5, 2.50, 7.00, 60, 8, '2026-06-22', 'disponible'),
(46, 'Colágeno hidrolizado 300g', 'Soporte para piel y articulaciones', 5, 5.00, 13.00, 16, 6, '2027-02-01', 'disponible'),
(47, 'Mascarilla facial 1u', 'Mascarilla de tratamiento', 9, 0.80, 2.50, 33, 10, NULL, 'disponible'),
(48, 'Kit analgésicos básico', 'Paracetamol e ibuprofeno', 4, 2.50, 6.50, 18, 4, '2025-10-31', 'disponible'),
(49, 'DAVIDPRO', 'PRODUCTO PARA MUSCULONES', 18, 10.00, 50.00, 49, 5, '2029-11-30', 'disponible'),
(50, 'PINGAMOL', 'PARA AIME', 12, 20.00, 100.00, 99, 5, '2025-10-31', 'disponible');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(8) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `usuario` varchar(50) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `rol` enum('super_admin','admin') NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `apellido`, `dni`, `telefono`, `email`, `usuario`, `clave`, `rol`, `estado`) VALUES
(1, 'DAVID', 'MESTA', '72357275', '987654321', 'davidmesta@gmail.com', '72357275', '$2b$10$rSMxsukkprboWEXwTA7NjOOZqsGvzhfgEBJsE/ae2oFPTUbWevPSW', 'super_admin', 'activo'),
(2, 'Admin', 'Local', '87654321', '999999999', 'admin_local@example.com', '87654321', '$2b$10$08Dal.9K/iDj.Ri3YZmsOuZ6vimQcBb2CNSQ8bPtcmdU4Jcwbuq0S', 'admin', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id_venta` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED DEFAULT NULL,
  `id_cliente` int(10) UNSIGNED DEFAULT NULL,
  `fecha_venta` timestamp NOT NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta','yape','plin') DEFAULT NULL,
  `estado` enum('completado','anulado') DEFAULT 'completado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`id_venta`, `id_usuario`, `id_cliente`, `fecha_venta`, `total`, `metodo_pago`, `estado`) VALUES
(1, NULL, 1, '2025-10-23 03:46:47', 6.50, 'efectivo', 'completado'),
(2, NULL, 2, '2025-10-27 00:26:42', 6.50, 'efectivo', 'completado'),
(3, NULL, 3, '2025-10-29 01:26:56', 48.00, 'efectivo', 'completado'),
(4, NULL, 4, '2025-10-29 05:12:10', 202.00, 'tarjeta', 'completado'),
(5, NULL, 4, '2025-10-29 05:22:58', 218.70, 'efectivo', 'completado'),
(6, NULL, 4, '2025-10-30 17:46:03', 150.00, 'yape', 'completado'),
(7, NULL, 6, '2025-10-31 22:43:07', 25.00, 'yape', 'completado'),
(8, NULL, 1, '2025-10-31 22:44:47', 5.00, 'tarjeta', 'completado');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `detalle_venta_id_venta_foreign` (`id_venta`),
  ADD KEY `detalle_venta_id_producto_foreign` (`id_producto`);

--
-- Indices de la tabla `knex_migrations`
--
ALTER TABLE `knex_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  ADD PRIMARY KEY (`index`);

--
-- Indices de la tabla `movimiento_stock`
--
ALTER TABLE `movimiento_stock`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `movimiento_stock_id_producto_foreign` (`id_producto`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `producto_id_categoria_foreign` (`id_categoria`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `usuario_dni_unique` (`dni`),
  ADD UNIQUE KEY `usuario_usuario_unique` (`usuario`),
  ADD UNIQUE KEY `usuario_email_unique` (`email`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `venta_id_usuario_foreign` (`id_usuario`),
  ADD KEY `venta_id_cliente_foreign` (`id_cliente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id_detalle` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `knex_migrations`
--
ALTER TABLE `knex_migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  MODIFY `index` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `movimiento_stock`
--
ALTER TABLE `movimiento_stock`
  MODIFY `id_movimiento` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id_venta` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `detalle_venta_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `detalle_venta_id_venta_foreign` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id_venta`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `movimiento_stock`
--
ALTER TABLE `movimiento_stock`
  ADD CONSTRAINT `movimiento_stock_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_id_categoria_foreign` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `venta_id_cliente_foreign` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `venta_id_usuario_foreign` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
