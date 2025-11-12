exports.up = async function(knex) {
  // categorias
  await knex.schema.createTable('categoria', table => {
    table.increments('id_categoria').primary();
    table.string('nombre_categoria', 100).notNullable();
    table.text('descripcion').nullable();
  });

  // clientes
  await knex.schema.createTable('cliente', table => {
    table.increments('id_cliente').primary();
    table.string('nombre', 100).notNullable();
    table.string('apellido', 100).nullable();
   
    table.string('dni', 8).nullable();
    table.string('telefono', 15).nullable();
    table.string('direccion', 255).nullable();
    table.string('email', 100).nullable();
  });

  // producto (referencia categoria)
  await knex.schema.createTable('producto', table => {
    table.increments('id_producto').primary();
    table.string('nombre_producto', 150).notNullable();
    table.text('descripcion').nullable();
    table.integer('id_categoria').unsigned().nullable()
      .references('id_categoria').inTable('categoria')
      .onUpdate('CASCADE').onDelete('SET NULL');
    table.decimal('precio_compra', 10, 2).notNullable();
    table.decimal('precio_venta', 10, 2).notNullable();
    table.integer('stock').defaultTo(0);
    table.integer('stock_minimo').defaultTo(5);
    table.date('fecha_vencimiento').nullable();
    table.enu('estado', ['disponible','agotado','vencimiento']).defaultTo('disponible');
  });

  // usuario
  await knex.schema.createTable('usuario', table => {
    table.increments('id_usuario').primary();
    table.string('nombre', 100).notNullable();
    table.string('apellido', 100).notNullable();
    table.string('dni', 8).notNullable().unique();
    table.string('telefono', 15).nullable();
    table.string('email', 100).nullable().unique();
    table.string('usuario', 50).notNullable().unique();
    table.string('clave', 255).notNullable();
    table.enu('rol', ['super_admin','admin']).notNullable();
    table.enu('estado', ['activo','inactivo']).defaultTo('activo');
  });

  // venta (referencia usuario, cliente)
  await knex.schema.createTable('venta', table => {
    table.increments('id_venta').primary();
    table.integer('id_usuario').unsigned().nullable()
      .references('id_usuario').inTable('usuario')
      .onUpdate('CASCADE').onDelete('SET NULL');
    table.integer('id_cliente').unsigned().nullable()
      .references('id_cliente').inTable('cliente')
      .onUpdate('CASCADE').onDelete('SET NULL');
    table.timestamp('fecha_venta').notNullable().defaultTo(knex.fn.now());
    table.decimal('total', 10, 2).notNullable();
    table.enu('metodo_pago', ['efectivo','tarjeta','yape','plin']).nullable();
    table.enu('estado', ['completado','anulado']).defaultTo('completado');
  });

  // detalle_venta (referencia venta, producto) - subtotal como generated column
  await knex.schema.createTable('detalle_venta', table => {
    table.increments('id_detalle').primary();
    table.integer('id_venta').unsigned().nullable()
      .references('id_venta').inTable('venta')
      .onUpdate('CASCADE').onDelete('SET NULL');
    table.integer('id_producto').unsigned().nullable()
      .references('id_producto').inTable('producto')
      .onUpdate('CASCADE').onDelete('CASCADE');
    table.integer('cantidad').notNullable();
    table.decimal('precio_unitario', 10, 2).notNullable();
  });

  // movimiento_stock (referencia producto)
  await knex.schema.createTable('movimiento_stock', table => {
    table.increments('id_movimiento').primary();
    table.integer('id_producto').unsigned().nullable()
      .references('id_producto').inTable('producto')
      .onUpdate('CASCADE').onDelete('CASCADE');
    table.enu('tipo', ['entrada','salida']).notNullable();
    table.integer('cantidad').notNullable();
    table.text('descripcion').nullable();
    table.timestamp('fecha_movimiento').notNullable().defaultTo(knex.fn.now());
  });

  
  await knex.raw(`
    ALTER TABLE detalle_venta
    ADD COLUMN subtotal decimal(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
  `);
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('movimiento_stock');
  await knex.schema.dropTableIfExists('detalle_venta');
  await knex.schema.dropTableIfExists('venta');
  await knex.schema.dropTableIfExists('usuario');
  await knex.schema.dropTableIfExists('producto');
  await knex.schema.dropTableIfExists('cliente');
  await knex.schema.dropTableIfExists('categoria');
};
