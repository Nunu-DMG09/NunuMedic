const bcrypt = require('bcryptjs');

module.exports.seed = async function(knex) {
  // borrar datos existentes en orden seguro
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('detalle_venta').del().catch(() => {});
  await knex('movimiento_stock').del().catch(() => {});
  await knex('venta').del().catch(() => {});
  await knex('producto').del().catch(() => {});
  await knex('categoria').del().catch(() => {});
  await knex('usuario').del().catch(() => {});
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // insertar 20 categorías con ids controlados (para referenciarlas en productos)
  const categorias = [
    { id_categoria: 1, nombre_categoria: 'Cuidado de la piel', descripcion: 'Productos para limpieza, hidratación y tratamiento facial y corporal' },
    { id_categoria: 2, nombre_categoria: 'Cuidado del cabello', descripcion: 'Champús, acondicionadores, tratamientos y styling' },
    { id_categoria: 3, nombre_categoria: 'Cuidado adulto', descripcion: 'Pañales, protectores y productos para el cuidado de adultos' },
    { id_categoria: 4, nombre_categoria: 'Medicamentos', descripcion: 'Medicamentos de venta libre y con receta' },
    { id_categoria: 5, nombre_categoria: 'Vitaminas y suplementos', descripcion: 'Vitaminas, minerales y suplementos nutricionales' },
    { id_categoria: 6, nombre_categoria: 'Higiene personal', descripcion: 'Jabones, desodorantes y artículos de aseo' },
    { id_categoria: 7, nombre_categoria: 'Bebés y maternidad', descripcion: 'Productos para recién nacidos y madres' },
    { id_categoria: 8, nombre_categoria: 'Cosmética', descripcion: 'Maquillaje y artículos cosméticos' },
    { id_categoria: 9, nombre_categoria: 'Dermocosmética', descripcion: 'Productos dermatológicos y para pieles sensibles' },
    { id_categoria: 10, nombre_categoria: 'Ortopedia', descripcion: 'Soportes, fajas y artículos ortopédicos' },
    { id_categoria: 11, nombre_categoria: 'Equipo médico', descripcion: 'Instrumental y equipos médicos básicos' },
    { id_categoria: 12, nombre_categoria: 'Aseo bucal', descripcion: 'Pastas, cepillos y enjuagues bucales' },
    { id_categoria: 13, nombre_categoria: 'Perfumería', descripcion: 'Fragancias y sets de regalo' },
    { id_categoria: 14, nombre_categoria: 'Suplementos deportivos', descripcion: 'Proteínas, recuperadores y complementos para deporte' },
    { id_categoria: 15, nombre_categoria: 'Nutrición y dietética', descripcion: 'Alimentos dietéticos y nutricionales' },
    { id_categoria: 16, nombre_categoria: 'Accesorios y cuidado general', descripcion: 'Accesorios varios y cuidado del hogar' },
    { id_categoria: 17, nombre_categoria: 'Cuidado femenino', descripcion: 'Productos de higiene y cuidado femenino' },
    { id_categoria: 18, nombre_categoria: 'Cuidado masculino', descripcion: 'Afeitado y grooming masculino' },
    { id_categoria: 19, nombre_categoria: 'Primera ayuda', descripcion: 'Vendas, antisépticos y kits de primeros auxilios' },
    { id_categoria: 20, nombre_categoria: 'Tratamientos dermatológicos', descripcion: 'Productos para tratamientos específicos de la piel' }
  ];

  await knex('categoria').insert(categorias);

  // crear 50 productos vinculados a las categorías anteriores
  const productos = [
    { nombre_producto: 'Gel limpiador facial 200ml', descripcion: 'Gel suave para limpieza diaria', id_categoria: 1, precio_compra: 2.5, precio_venta: 5.0, stock: 50, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Crema hidratante 50ml', descripcion: 'Hidratación para piel sensible', id_categoria: 1, precio_compra: 3.2, precio_venta: 7.5, stock: 40, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Protector solar SPF50 100ml', descripcion: 'Protector contra rayos UV', id_categoria: 1, precio_compra: 4.0, precio_venta: 9.99, stock: 30, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Shampoo reparador 400ml', descripcion: 'Nutre y repara el cabello', id_categoria: 2, precio_compra: 2.0, precio_venta: 6.5, stock: 25, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Acondicionador nutritivo 400ml', descripcion: 'Suaviza y desenreda', id_categoria: 2, precio_compra: 1.8, precio_venta: 5.5, stock: 28, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Tónico capilar 150ml', descripcion: 'Estimula el cuero cabelludo', id_categoria: 2, precio_compra: 1.5, precio_venta: 4.5, stock: 20, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Pañales talla M (20u)', descripcion: 'Pañales absorbentes', id_categoria: 3, precio_compra: 6.0, precio_venta: 12.0, stock: 15, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Protectores diarios 30u', descripcion: 'Cuidado diario íntimo', id_categoria: 3, precio_compra: 1.5, precio_venta: 3.5, stock: 60, stock_minimo: 10, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Ibuprofeno 400mg 20 tabs', descripcion: 'Analgésico', id_categoria: 4, precio_compra: 0.8, precio_venta: 2.5, stock: 100, stock_minimo: 10, fecha_vencimiento: '2026-08-01', estado: 'disponible' },
    { nombre_producto: 'Paracetamol 500mg 20 tabs', descripcion: 'Analgésico y antipirético', id_categoria: 4, precio_compra: 0.6, precio_venta: 2.0, stock: 120, stock_minimo: 10, fecha_vencimiento: '2026-12-01', estado: 'disponible' },
    { nombre_producto: 'Amoxicilina 500mg 12 caps', descripcion: 'Antibiótico', id_categoria: 4, precio_compra: 1.5, precio_venta: 5.0, stock: 10, stock_minimo: 5, fecha_vencimiento: '2025-12-31', estado: 'disponible' },
    { nombre_producto: 'Vitamina C 500mg 60 caps', descripcion: 'Suplemento antioxidante', id_categoria: 5, precio_compra: 2.0, precio_venta: 6.0, stock: 75, stock_minimo: 10, fecha_vencimiento: '2027-03-01', estado: 'disponible' },
    { nombre_producto: 'Multivitamínico adulto 30 caps', descripcion: 'Complejo vitamínico diario', id_categoria: 5, precio_compra: 3.5, precio_venta: 9.5, stock: 50, stock_minimo: 10, fecha_vencimiento: '2027-06-01', estado: 'disponible' },
    { nombre_producto: 'Omega 3 1000mg 30 caps', descripcion: 'Ácidos grasos esenciales', id_categoria: 5, precio_compra: 4.0, precio_venta: 11.0, stock: 35, stock_minimo: 8, fecha_vencimiento: '2027-01-15', estado: 'disponible' },
    { nombre_producto: 'Jabón líquido 500ml', descripcion: 'Jabón corporal nutritivo', id_categoria: 6, precio_compra: 0.8, precio_venta: 2.0, stock: 90, stock_minimo: 10, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Desodorante roll-on 50ml', descripcion: 'Protección 24h', id_categoria: 6, precio_compra: 0.9, precio_venta: 2.5, stock: 70, stock_minimo: 10, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Leche de fórmula 400g', descripcion: 'Alimento para bebés', id_categoria: 7, precio_compra: 5.0, precio_venta: 12.5, stock: 20, stock_minimo: 5, fecha_vencimiento: '2026-05-01', estado: 'disponible' },
    { nombre_producto: 'Toallas húmedas bebé 72u', descripcion: 'Limpieza suave', id_categoria: 7, precio_compra: 1.2, precio_venta: 3.0, stock: 80, stock_minimo: 10, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Base líquida tono medio 30ml', descripcion: 'Maquillaje cobertura media', id_categoria: 8, precio_compra: 3.0, precio_venta: 8.0, stock: 25, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Rímel volumen 10ml', descripcion: 'Pestañas definidas', id_categoria: 8, precio_compra: 1.5, precio_venta: 4.5, stock: 40, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Crema dermocosmética 30ml', descripcion: 'Tratamiento piel sensible', id_categoria: 9, precio_compra: 5.0, precio_venta: 14.0, stock: 18, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Serum anti-edad 30ml', descripcion: 'Reducción de arrugas', id_categoria: 9, precio_compra: 6.5, precio_venta: 18.0, stock: 12, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Rodillera elástica talla M', descripcion: 'Soporte ortopédico', id_categoria: 10, precio_compra: 8.0, precio_venta: 20.0, stock: 10, stock_minimo: 2, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Termómetro digital', descripcion: 'Termómetro clínico digital', id_categoria: 11, precio_compra: 4.0, precio_venta: 10.0, stock: 25, stock_minimo: 3, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Pasta dental blanqueante 90ml', descripcion: 'Higiene bucal diaria', id_categoria: 12, precio_compra: 0.7, precio_venta: 2.0, stock: 100, stock_minimo: 10, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Cepillo dental suave', descripcion: 'Cepillo de cerdas suaves', id_categoria: 12, precio_compra: 0.3, precio_venta: 1.0, stock: 150, stock_minimo: 20, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Perfume dama 50ml', descripcion: 'Fragancia floral', id_categoria: 13, precio_compra: 8.0, precio_venta: 22.0, stock: 15, stock_minimo: 3, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Eau de toilette caballero 100ml', descripcion: 'Aroma fresco', id_categoria: 13, precio_compra: 9.0, precio_venta: 24.0, stock: 12, stock_minimo: 3, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Proteína whey 1kg', descripcion: 'Suplemento deportivo', id_categoria: 14, precio_compra: 12.0, precio_venta: 30.0, stock: 20, stock_minimo: 5, fecha_vencimiento: '2026-11-01', estado: 'disponible' },
    { nombre_producto: 'Barras energéticas 12u', descripcion: 'Snacks para deportistas', id_categoria: 14, precio_compra: 6.0, precio_venta: 14.0, stock: 40, stock_minimo: 8, fecha_vencimiento: '2026-02-01', estado: 'disponible' },
    { nombre_producto: 'Harina de avena 500g', descripcion: 'Alimento dietético', id_categoria: 15, precio_compra: 1.0, precio_venta: 2.5, stock: 60, stock_minimo: 10, fecha_vencimiento: '2027-09-01', estado: 'disponible' },
    { nombre_producto: 'Suplemento proteico vegetal 250g', descripcion: 'Alternativa vegana', id_categoria: 15, precio_compra: 4.5, precio_venta: 11.0, stock: 22, stock_minimo: 5, fecha_vencimiento: '2026-09-01', estado: 'disponible' },
    { nombre_producto: 'Esponja de baño', descripcion: 'Accesorio de baño', id_categoria: 16, precio_compra: 0.3, precio_venta: 1.0, stock: 120, stock_minimo: 15, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Cortaúñas acero', descripcion: 'Accesorio de cuidado personal', id_categoria: 16, precio_compra: 0.2, precio_venta: 0.8, stock: 200, stock_minimo: 20, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Compresas noche 14u', descripcion: 'Cuidado femenino', id_categoria: 17, precio_compra: 0.9, precio_venta: 2.5, stock: 85, stock_minimo: 10, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Toallas íntimas 20u', descripcion: 'Cuidado femenino diario', id_categoria: 17, precio_compra: 0.8, precio_venta: 2.0, stock: 95, stock_minimo: 10, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Crema de afeitar 150ml', descripcion: 'Afeitado suave', id_categoria: 18, precio_compra: 0.9, precio_venta: 2.5, stock: 60, stock_minimo: 8, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Aftershave 100ml', descripcion: 'Cuidado post-afeitado', id_categoria: 18, precio_compra: 1.2, precio_venta: 3.5, stock: 30, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Vendas estériles 5x5 10u', descripcion: 'Primera ayuda básica', id_categoria: 19, precio_compra: 0.5, precio_venta: 1.5, stock: 140, stock_minimo: 20, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Alcohol 70% 500ml', descripcion: 'Antiséptico', id_categoria: 19, precio_compra: 0.8, precio_venta: 2.2, stock: 90, stock_minimo: 15, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Crema antiacné 30ml', descripcion: 'Tratamiento dermatológico', id_categoria: 20, precio_compra: 4.0, precio_venta: 10.0, stock: 14, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Ampolla reparadora 10ml', descripcion: 'Tratamiento intensivo', id_categoria: 20, precio_compra: 2.2, precio_venta: 6.0, stock: 9, stock_minimo: 5, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Pastillas para la tos 24u', descripcion: 'Alivio de la tos', id_categoria: 4, precio_compra: 0.7, precio_venta: 2.2, stock: 0, stock_minimo: 5, fecha_vencimiento: '2026-04-01', estado: 'agotado' },
    { nombre_producto: 'Ungüento analgésico 30g', descripcion: 'Uso tópico para dolor', id_categoria: 4, precio_compra: 1.2, precio_venta: 3.5, stock: 5, stock_minimo: 5, fecha_vencimiento: '2026-10-01', estado: 'disponible' },
    { nombre_producto: 'Vitamina D 1000UI 60 caps', descripcion: 'Suplemento esencial', id_categoria: 5, precio_compra: 2.5, precio_venta: 7.0, stock: 8, stock_minimo: 8, fecha_vencimiento: '2026-07-01', estado: 'vencimiento' },
    { nombre_producto: 'Colágeno hidrolizado 300g', descripcion: 'Soporte para piel y articulaciones', id_categoria: 5, precio_compra: 5.0, precio_venta: 13.0, stock: 18, stock_minimo: 6, fecha_vencimiento: '2027-02-01', estado: 'disponible' },
    { nombre_producto: 'Mascarilla facial 1u', descripcion: 'Mascarilla de tratamiento', id_categoria: 9, precio_compra: 0.8, precio_venta: 2.5, stock: 45, stock_minimo: 10, fecha_vencimiento: null, estado: 'disponible' },
    { nombre_producto: 'Kit analgésicos básico', descripcion: 'Paracetamol e ibuprofeno', id_categoria: 4, precio_compra: 2.5, precio_venta: 6.5, stock: 12, stock_minimo: 4, fecha_vencimiento: '2027-01-01', estado: 'disponible' }
  ];

  // insertar productos en lotes para no exceder tamaño de query
  const chunkSize = 25;
  for (let i = 0; i < productos.length; i += chunkSize) {
    const chunk = productos.slice(i, i + chunkSize);
    await knex('producto').insert(chunk);
  }

  // crear 2 usuarios: super_admin (DAVID MESTA) y admin
  const passSuper = bcrypt.hashSync('72357275', 10); // clave = dni
  const passAdmin = bcrypt.hashSync('87654321', 10);

  const usuarios = [
    { nombre: 'DAVID', apellido: 'MESTA', dni: '72357275', telefono: '987654321', email: 'davidmesta@gmail.com', usuario: '72357275', clave: passSuper, rol: 'super_admin', estado: 'activo' },
    { nombre: 'Admin', apellido: 'Local', dni: '87654321', telefono: '999999999', email: 'admin_local@example.com', usuario: '87654321', clave: passAdmin, rol: 'admin', estado: 'activo' }
  ];

  await knex('usuario').insert(usuarios);

  // si knex usa tabla knex_migrations, dejarla intacta; fin de seed
  return;
};