// ==========================================
// SISTEMA VALENTÍN - VERSIÓN SIMPLE
// ==========================================

// ==========================================
// LOCALSTORAGE - FUNCIONES BÁSICAS
// ==========================================

function guardar(clave, datos) {
    localStorage.setItem('valentin_' + clave, JSON.stringify(datos));
}

function obtener(clave) {
    const datos = localStorage.getItem('valentin_' + clave);
    return datos ? JSON.parse(datos) : [];
}

// ==========================================
// DATOS DE EJEMPLO
// ==========================================

function datosEjemplo() {
    if (obtener('inventario').length === 0) {
        guardar('inventario', [
            { codigo: 'B-001', nombre: 'Anillo de Plata', categoria: 'Anillos', stock: 15, precio: 85000 },
            { codigo: 'B-002', nombre: 'Pulsera de Cuentas', categoria: 'Pulseras', stock: 8, precio: 58000 },
            { codigo: 'B-003', nombre: 'Collar de Perlas', categoria: 'Collares', stock: 4, precio: 120000 }
        ]);
    }
   if (obtener('clientes').length === 0) {
    guardar('clientes', [
        { nombre: 'María González', email: 'maria@email.com', telefono: '311 567 8901', estado: 'Activo' },
        { nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '320 123 4567', estado: 'Activo' },
        { nombre: 'Carlos López', email: 'carlos@email.com', telefono: '315 789 0123', estado: 'Activo' },
        { nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '322 456 7890', estado: 'Activo' }
    ]);
}
    if (obtener('ventas').length === 0) {
        guardar('ventas', [
            { numero: 'V-001', cliente: 'María González', producto: 'Anillo de Plata', cantidad: 2, total: 90000, fecha: '15/06/2024', estado: 'Completada' },
            { numero: 'V-002', cliente: 'Juan Pérez', producto: 'Collar de Perlas', cantidad: 1, total: 120000, fecha: '14/06/2024', estado: 'Completada' }
        ]);
    }
}

// ==========================================
// INICIALIZAR
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    datosEjemplo();
    
    const pagina = window.location.pathname.split('/').pop();
    if (pagina === 'dashboard.html') cargarDashboard();
    else if (pagina === 'inventario.html') cargarInventario();
    else if (pagina === 'ventas.html') cargarVentas();
    else if (pagina === 'clientes.html') cargarClientes();
    else if (pagina === 'reportes.html') cargarReportes();
    else if (pagina === 'configuracion.html') cargarConfiguracion();
    else if (pagina === 'exportar.html') cargarExportar();

    // Cerrar sesión
    document.querySelectorAll('.cerrar-sesion').forEach(function(b) {
        b.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Cerrar sesión?')) {
                localStorage.removeItem('valentin_sesion');
                window.location.href = 'index.html';
            }
        });
    });
});

// ==========================================
// DASHBOARD
// ==========================================

function cargarDashboard() {
    const productos = obtener('inventario');
    const clientes = obtener('clientes');
    const ventas = obtener('ventas');

    let totalStock = 0;
    productos.forEach(function(p) { totalStock += p.stock || 0; });
    document.getElementById('productos-stock').textContent = totalStock;
    document.getElementById('clientes-activos').textContent = clientes.length;

    let ventasHoy = 0;
    const hoy = new Date().toLocaleDateString('es-CO');
    ventas.forEach(function(v) { if (v.fecha === hoy) ventasHoy += v.total || 0; });
    document.getElementById('ventas-hoy').textContent = '$' + (ventasHoy || 0).toLocaleString();

    // Botones
    document.getElementById('refrescar-datos')?.addEventListener('click', function() { cargarDashboard(); });
    document.getElementById('exportar-resumen')?.addEventListener('click', function() { alert('📊 Exportando...'); });
}

// ==========================================
// INVENTARIO
// ==========================================

function cargarInventario() {
    mostrarProductos();

    // Agregar
    document.querySelectorAll('.btn-agregar[data-form="form-inventario"]').forEach(function(b) {
        b.addEventListener('click', function() {
            const f = document.getElementById('form-inventario');
            f.style.display = f.style.display === 'none' ? 'block' : 'none';
            this.textContent = f.style.display === 'block' ? '✖ Ocultar' : '➕ Agregar producto';
        });
    });

    // Guardar
    document.getElementById('guardar-producto')?.addEventListener('click', function(e) {
        e.preventDefault();
        const codigo = document.getElementById('prod-codigo').value.trim();
        const nombre = document.getElementById('prod-nombre').value.trim();
        const stock = parseInt(document.getElementById('prod-stock').value);
        const precio = parseFloat(document.getElementById('prod-precio').value);
        if (!codigo || !nombre || isNaN(stock) || isNaN(precio)) { alert('Complete los campos'); return; }
        const p = obtener('inventario');
        p.push({ codigo, nombre, categoria: document.getElementById('prod-categoria').value || 'General', stock, precio });
        guardar('inventario', p);
        mostrarProductos();
        document.getElementById('form-inventario').style.display = 'none';
        alert('💎 Producto guardado');
    });

    // Cancelar
    document.getElementById('cancelar-producto')?.addEventListener('click', function() {
        document.getElementById('form-inventario').style.display = 'none';
    });

    // Buscar
    document.querySelectorAll('.buscar').forEach(function(i) {
        i.addEventListener('keyup', function() {
            const texto = this.value.toLowerCase();
            document.querySelectorAll('#tabla-productos tr').forEach(function(f) {
                f.style.display = f.textContent.toLowerCase().includes(texto) ? '' : 'none';
            });
        });
    });

    // Exportar
    document.getElementById('exportar-inventario')?.addEventListener('click', function() {
        alert('📤 Exportando ' + obtener('inventario').length + ' productos');
    });
}

function mostrarProductos() {
    const productos = obtener('inventario');
    const tbody = document.getElementById('tabla-productos');
    if (!tbody) return;
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#999;">📦 No hay productos</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    productos.forEach(function(p, i) {
        const estado = p.stock === 0 ? 'Agotado' : p.stock <= 5 ? 'Stock bajo' : 'Disponible';
        const clase = p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success';
        tbody.innerHTML += `
            <tr>
                <td><strong>${p.codigo || 'B-001'}</strong></td>
                <td>${p.nombre}</td>
                <td>${p.categoria || 'General'}</td>
                <td>${p.stock}</td>
                <td>$${p.precio.toLocaleString()}</td>
                <td><span class="badge ${clase}">${estado}</span></td>
                <td>
                    <button class="btn-editar" data-i="${i}" style="padding:5px 10px; background:#ffc107; border:none; border-radius:5px; cursor:pointer;">✏️</button>
                    <button class="btn-eliminar" data-i="${i}" style="padding:5px 10px; background:#dc3545; color:white; border:none; border-radius:5px; cursor:pointer;">🗑️</button>
                </td>
            </tr>
        `;
    });

    // Eliminar
    document.querySelectorAll('#tabla-productos .btn-eliminar').forEach(function(b) {
        b.addEventListener('click', function() {
            if (confirm('¿Eliminar?')) {
                const p = obtener('inventario');
                p.splice(parseInt(this.dataset.i), 1);
                guardar('inventario', p);
                mostrarProductos();
            }
        });
    });

    // Editar
    document.querySelectorAll('#tabla-productos .btn-editar').forEach(function(b) {
        b.addEventListener('click', function() {
            const p = obtener('inventario')[parseInt(this.dataset.i)];
            alert('✏️ ' + p.nombre + '\nStock: ' + p.stock + '\nPrecio: $' + p.precio);
        });
    });

    // KPIs
    let total = productos.length, bajo = 0, agotados = 0, valor = 0;
    productos.forEach(function(p) {
        if (p.stock === 0) agotados++;
        else if (p.stock <= 5) bajo++;
        valor += p.stock * p.precio;
    });
    document.getElementById('total-productos').textContent = total;
    document.getElementById('stock-bajo').textContent = bajo;
    document.getElementById('agotados').textContent = agotados;
    document.getElementById('valor-stock').textContent = '$' + valor.toLocaleString();
    document.getElementById('contador-productos').textContent = total;
}

// ==========================================
// VENTAS
// ==========================================

function cargarVentas() {
    mostrarVentas();

    document.querySelectorAll('.btn-agregar[data-form="form-ventas"]').forEach(function(b) {
        b.addEventListener('click', function() {
            const f = document.getElementById('form-ventas');
            f.style.display = f.style.display === 'none' ? 'block' : 'none';
            this.textContent = f.style.display === 'block' ? '✖ Ocultar' : '➕ Nueva venta';
        });
    });

    document.getElementById('guardar-venta')?.addEventListener('click', function(e) {
        e.preventDefault();
        const cliente = document.getElementById('venta-cliente').value;
        const producto = document.getElementById('venta-producto').value;
        const cantidad = parseInt(document.getElementById('venta-cantidad').value) || 1;
        const pago = document.getElementById('venta-pago').value;
        if (!producto || cantidad < 1) { alert('Seleccione producto'); return; }
        const precioTexto = document.getElementById('venta-producto').options[document.getElementById('venta-producto').selectedIndex].text;
        const precio = parseInt(precioTexto.match(/\$([0-9,]+)/)?.[1]?.replace(/,/g, '') || 0);
        const v = obtener('ventas');
        v.push({ numero: 'V-' + String(v.length + 1).padStart(3, '0'), cliente, producto, cantidad, total: precio * cantidad, pago, fecha: new Date().toLocaleDateString('es-CO'), estado: 'Completada' });
        guardar('ventas', v);
        mostrarVentas();
        document.getElementById('form-ventas').style.display = 'none';
        alert('✅ Venta registrada');
    });

    document.getElementById('cancelar-venta')?.addEventListener('click', function() {
        document.getElementById('form-ventas').style.display = 'none';
    });

    document.querySelectorAll('.buscar').forEach(function(i) {
        i.addEventListener('keyup', function() {
            const texto = this.value.toLowerCase();
            document.querySelectorAll('#tabla-ventas tr').forEach(function(f) {
                f.style.display = f.textContent.toLowerCase().includes(texto) ? '' : 'none';
            });
        });
    });

    document.getElementById('exportar-ventas')?.addEventListener('click', function() {
        alert('📤 Exportando ' + obtener('ventas').length + ' ventas');
    });
}

function mostrarVentas() {
    const ventas = obtener('ventas');
    const tbody = document.getElementById('tabla-ventas');
    if (!tbody) return;
    if (ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#999;">🛒 No hay ventas</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    ventas.forEach(function(v, i) {
        const clase = v.estado === 'Completada' ? 'badge-success' : 'badge-warning';
        tbody.innerHTML += `
            <tr>
                <td><strong>${v.numero}</strong></td>
                <td>${v.cliente}</td>
                <td>${v.producto} x${v.cantidad}</td>
                <td>$${v.total.toLocaleString()}</td>
                <td>${v.pago || 'Efectivo'}</td>
                <td>${v.fecha}</td>
                <td><span class="badge ${clase}">${v.estado}</span></td>
                <td>
                    <button class="btn-ver" data-i="${i}" style="padding:5px 10px; background:#17a2b8; color:white; border:none; border-radius:5px; cursor:pointer;">👁️</button>
                    <button class="btn-eliminar-venta" data-i="${i}" style="padding:5px 10px; background:#dc3545; color:white; border:none; border-radius:5px; cursor:pointer;">🗑️</button>
                </td>
            </tr>
        `;
    });

    document.querySelectorAll('#tabla-ventas .btn-eliminar-venta').forEach(function(b) {
        b.addEventListener('click', function() {
            if (confirm('¿Eliminar?')) {
                const v = obtener('ventas');
                v.splice(parseInt(this.dataset.i), 1);
                guardar('ventas', v);
                mostrarVentas();
            }
        });
    });

    document.querySelectorAll('#tabla-ventas .btn-ver').forEach(function(b) {
        b.addEventListener('click', function() {
            const v = obtener('ventas')[parseInt(this.dataset.i)];
            alert('👁️ ' + v.cliente + '\nProducto: ' + v.producto + '\nTotal: $' + v.total);
        });
    });

    // KPIs
    let hoy = new Date().toLocaleDateString('es-CO'), ventasHoy = 0, mes = 0;
    ventas.forEach(function(v) {
        if (v.fecha === hoy) ventasHoy += v.total || 0;
        mes += v.total || 0;
    });
    document.getElementById('ventas-hoy').textContent = '$' + ventasHoy.toLocaleString();
    document.getElementById('num-ventas').textContent = ventas.length;
    document.getElementById('ventas-mes').textContent = '$' + mes.toLocaleString();
    document.getElementById('ticket-promedio').textContent = '$' + (ventas.length > 0 ? Math.round(mes / ventas.length) : 0).toLocaleString();
    document.getElementById('contador-ventas').textContent = ventas.length;
}

// ==========================================
// CLIENTES
// ==========================================

function cargarClientes() {
    mostrarClientes();

    document.querySelectorAll('.btn-agregar[data-form="form-clientes"]').forEach(function(b) {
        b.addEventListener('click', function() {
            const f = document.getElementById('form-clientes');
            f.style.display = f.style.display === 'none' ? 'block' : 'none';
            this.textContent = f.style.display === 'block' ? '✖ Ocultar' : '➕ Nuevo cliente';
        });
    });

    document.getElementById('guardar-cliente')?.addEventListener('click', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('cliente-nombre').value.trim();
        const email = document.getElementById('cliente-email').value.trim();
        if (!nombre || !email) { alert('Complete nombre y email'); return; }
        const c = obtener('clientes');
        c.push({ nombre, email, telefono: document.getElementById('cliente-telefono').value || '—', direccion: document.getElementById('cliente-direccion').value || '—', compras: 0, ultimaCompra: '—', estado: 'Activo' });
        guardar('clientes', c);
        mostrarClientes();
        document.getElementById('form-clientes').style.display = 'none';
        alert('👤 Cliente guardado');
    });

    document.getElementById('cancelar-cliente')?.addEventListener('click', function() {
        document.getElementById('form-clientes').style.display = 'none';
    });

    document.querySelectorAll('.buscar').forEach(function(i) {
        i.addEventListener('keyup', function() {
            const texto = this.value.toLowerCase();
            document.querySelectorAll('#tabla-clientes tr').forEach(function(f) {
                f.style.display = f.textContent.toLowerCase().includes(texto) ? '' : 'none';
            });
        });
    });

    document.getElementById('exportar-clientes')?.addEventListener('click', function() {
        alert('📤 Exportando ' + obtener('clientes').length + ' clientes');
    });
}

function mostrarClientes() {
    const clientes = obtener('clientes');
    const tbody = document.getElementById('tabla-clientes');
    if (!tbody) return;
    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#999;">👤 No hay clientes</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    clientes.forEach(function(c, i) {
        tbody.innerHTML += `
            <tr>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.telefono || '—'}</td>
                <td>${c.email || '—'}</td>
                <td>${c.compras || 0}</td>
                <td>${c.ultimaCompra || '—'}</td>
                <td><span class="badge ${c.estado === 'Activo' ? 'badge-success' : 'badge-warning'}">${c.estado || 'Activo'}</span></td>
                <td>
                    <button class="btn-editar-cliente" data-i="${i}" style="padding:5px 10px; background:#ffc107; border:none; border-radius:5px; cursor:pointer;">✏️</button>
                    <button class="btn-eliminar-cliente" data-i="${i}" style="padding:5px 10px; background:#dc3545; color:white; border:none; border-radius:5px; cursor:pointer;">🗑️</button>
                </td>
            </tr>
        `;
    });

    document.querySelectorAll('#tabla-clientes .btn-eliminar-cliente').forEach(function(b) {
        b.addEventListener('click', function() {
            if (confirm('¿Eliminar?')) {
                const c = obtener('clientes');
                c.splice(parseInt(this.dataset.i), 1);
                guardar('clientes', c);
                mostrarClientes();
            }
        });
    });

    document.querySelectorAll('#tabla-clientes .btn-editar-cliente').forEach(function(b) {
        b.addEventListener('click', function() {
            const c = obtener('clientes')[parseInt(this.dataset.i)];
            alert('✏️ ' + c.nombre + '\nEmail: ' + c.email + '\nTeléfono: ' + c.telefono);
        });
    });

    document.getElementById('clientes-activos').textContent = clientes.length;
    document.getElementById('contador-clientes').textContent = clientes.length;
}

// ==========================================
// REPORTES
// ==========================================

function cargarReportes() {
    const ventas = obtener('ventas');
    const clientes = obtener('clientes');
    let ingresos = 0, unidades = 0;
    ventas.forEach(function(v) { ingresos += v.total || 0; unidades += v.cantidad || 0; });
    document.getElementById('ingresos-periodo').textContent = '$' + ingresos.toLocaleString();
    document.getElementById('unidades-vendidas').textContent = unidades;
    document.getElementById('nuevos-clientes').textContent = clientes.length;

    // Botones
    document.getElementById('generar-reporte')?.addEventListener('click', function() { alert('🔄 Reporte generado'); });
    document.getElementById('exportar-reporte')?.addEventListener('click', function() { alert('📤 Reporte exportado'); });
    document.getElementById('aplicar-filtros')?.addEventListener('click', function() { alert('✅ Filtros aplicados'); });
    document.getElementById('limpiar-filtros')?.addEventListener('click', function() { alert('🗑️ Filtros limpiados'); });
    document.getElementById('actualizar-grafico')?.addEventListener('click', function() { alert('📈 Gráfico actualizado'); });
}

// ==========================================
// CONFIGURACIÓN
// ==========================================

function cargarConfiguracion() {
    document.getElementById('guardar-cambios')?.addEventListener('click', function() { alert('✅ Guardado'); });
    document.getElementById('guardar-tienda')?.addEventListener('click', function() { alert('✅ Datos de tienda guardados'); });
    document.getElementById('guardar-moneda')?.addEventListener('click', function() { alert('✅ Moneda e idioma guardados'); });
    document.getElementById('guardar-preferencias')?.addEventListener('click', function() { alert('✅ Preferencias guardadas'); });
    document.getElementById('restaurar-config')?.addEventListener('click', function() { if (confirm('¿Restaurar?')) { localStorage.clear(); location.reload(); } });
    document.getElementById('eliminar-datos')?.addEventListener('click', function() { if (confirm('¿Eliminar todo?')) { localStorage.clear(); location.reload(); } });
}

// ==========================================
// EXPORTAR
// ==========================================

function cargarExportar() {
    document.getElementById('exportar-todo')?.addEventListener('click', function() { alert('📥 Exportando todo...'); });
    document.querySelectorAll('.btn-exportar-datos').forEach(function(b) {
        b.addEventListener('click', function() { alert('📤 Exportando ' + (this.dataset.tipo || 'datos')); });
    });
    document.getElementById('aplicar-opciones')?.addEventListener('click', function() { alert('✅ Opciones aplicadas'); });
    document.getElementById('limpiar-historial')?.addEventListener('click', function() { if (confirm('¿Limpiar historial?')) { document.getElementById('tabla-exportaciones').innerHTML = ''; } });
}