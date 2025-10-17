import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ProductoList() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    api.get('/productos')
      .then(res => setProductos(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Productos</h2>
      <ul>
        {productos.map(p => (
          <li key={p.id_producto}>
            {p.nombre_producto} — stock: {p.stock} — S/. {p.precio_venta}
          </li>
        ))}
      </ul>
    </div>
  );
}