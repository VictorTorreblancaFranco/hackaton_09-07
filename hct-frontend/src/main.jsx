import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Car, Check, Edit3, RefreshCw, Save, Trash2, User, WalletCards, X } from 'lucide-react';
import './styles.css';

const today = new Date().toISOString().slice(0, 10);

const services = {
  vehiculos: {
    key: 'vehiculos',
    title: 'Vehiculos',
    icon: Car,
    url: 'http://localhost:8081/api/vehiculos',
    empty: {
      placa: '',
      marca: '',
      modelo: '',
      anio: 2026,
      color: '',
      precioPorDia: 150,
      estado: 'DISPONIBLE'
    },
    fields: [
      ['placa', 'Placa'],
      ['marca', 'Marca'],
      ['modelo', 'Modelo'],
      ['anio', 'Anio', 'number'],
      ['color', 'Color'],
      ['precioPorDia', 'Precio por dia (S/)', 'number']
    ],
    tableFields: [
      ['placa', 'Placa'],
      ['marca', 'Marca'],
      ['modelo', 'Modelo'],
      ['anio', 'Anio'],
      ['color', 'Color'],
      ['precioPorDia', 'Precio por dia'],
      ['estado', 'Estado']
    ],
    moneyFields: ['precioPorDia']
  },
  clientes: {
    key: 'clientes',
    title: 'Clientes',
    icon: User,
    url: 'http://localhost:8082/api/clientes',
    empty: {
      dni: '',
      nombres: '',
      apellidos: '',
      celular: '',
      correo: '',
      licencia: '',
      estado: 'ACTIVO'
    },
    fields: [
      ['dni', 'DNI'],
      ['nombres', 'Nombres'],
      ['apellidos', 'Apellidos'],
      ['celular', 'Celular'],
      ['correo', 'Correo', 'email'],
      ['licencia', 'Licencia']
    ],
    tableFields: [
      ['dni', 'DNI'],
      ['nombres', 'Nombres'],
      ['apellidos', 'Apellidos'],
      ['celular', 'Celular'],
      ['correo', 'Correo'],
      ['licencia', 'Licencia'],
      ['estado', 'Estado']
    ]
  },
  alquileres: {
    key: 'alquileres',
    title: 'Alquileres',
    icon: WalletCards,
    url: 'http://localhost:8083/api/alquileres',
    empty: {
      clienteId: 1,
      vehiculoId: 1,
      dias: 3,
      fechaInicio: today,
      fechaFin: today,
      total: 720,
      estado: 'ACTIVO'
    },
    fields: [
      ['clienteId', 'Cliente ID', 'number'],
      ['vehiculoId', 'Vehiculo ID', 'number'],
      ['dias', 'Dias', 'number'],
      ['fechaInicio', 'Fecha inicio', 'date'],
      ['fechaFin', 'Fecha fin', 'date'],
      ['total', 'Total (S/)', 'number']
    ],
    tableFields: [
      ['clienteId', 'Cliente ID'],
      ['vehiculoId', 'Vehiculo ID'],
      ['dias', 'Dias'],
      ['fechaInicio', 'Fecha inicio'],
      ['fechaFin', 'Fecha fin'],
      ['total', 'Total'],
      ['estado', 'Estado']
    ],
    moneyFields: ['total']
  }
};

function formatPlate(value) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  if (clean.length <= 3) {
    return clean;
  }
  return `${clean.slice(0, 3)}-${clean.slice(3)}`;
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return `S/ ${Number(value).toFixed(2)}`;
}

function formatCell(config, field, value) {
  if (config.moneyFields?.includes(field)) {
    return formatMoney(value);
  }
  return value;
}

function normalizeValue(type, value) {
  if (type === 'number') {
    return value === '' ? '' : Number(value);
  }
  return value;
}

function ResourcePanel({ config }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(config.empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tableFields = config.tableFields ?? config.fields;
  const visibleFields = useMemo(() => tableFields.map(([key]) => key), [tableFields]);

  async function loadItems() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(config.url);
      if (!response.ok) throw new Error();
      setItems(await response.json());
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [config.url]);

  function changeField(key, type, value) {
    setForm((current) => ({
      ...current,
      [key]: key === 'placa' ? formatPlate(value) : normalizeValue(type, value)
    }));
  }

  async function changeVehicleStatus(id, estado) {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${config.url}/${id}/estado?estado=${estado}`, { method: 'PUT' });
      if (!response.ok) throw new Error();
      await loadItems();
      setMessage('Estado actualizado.');
    } catch (error) {
      setMessage('');
    } finally {
      setLoading(false);
    }
  }

  function edit(item) {
    setEditingId(item.id);
    setForm(
      config.fields.reduce((next, [key]) => {
        next[key] = item[key] ?? '';
        return next;
      }, { ...config.empty })
    );
  }

  function cancel() {
    setEditingId(null);
    setForm(config.empty);
    setMessage('');
  }

  async function save(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(editingId ? `${config.url}/${editingId}` : config.url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error();
      cancel();
      await loadItems();
      setMessage(editingId ? 'Registro actualizado.' : 'Registro creado.');
    } catch (error) {
      setMessage('');
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${config.url}/${id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) throw new Error();
      await loadItems();
      setMessage('Registro eliminado.');
    } catch (error) {
      setMessage('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="resource">
      <form className="form" onSubmit={save}>
        <div className="form-header">
          <h2>{editingId ? `Editar ${config.title}` : `Nuevo ${config.title}`}</h2>
          <div className="actions">
            <button type="button" className="icon-button" onClick={loadItems} title="Actualizar">
              <RefreshCw size={18} />
            </button>
            {editingId && (
              <button type="button" className="icon-button" onClick={cancel} title="Cancelar">
                <X size={18} />
              </button>
            )}
            <button type="submit" className="primary-button" disabled={loading}>
              <Save size={18} />
              Guardar
            </button>
          </div>
        </div>

        <div className="fields">
          {config.fields.map(([key, label, type = 'text']) => (
            <label key={key}>
              <span>{label}</span>
              <input
                type={type}
                value={form[key]}
                onChange={(event) => changeField(key, type, event.target.value)}
                maxLength={key === 'placa' ? 7 : undefined}
                placeholder={key === 'placa' ? 'ABC-123' : undefined}
                required
              />
            </label>
          ))}
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              {tableFields.map(([, label]) => (
                <th key={label}>{label}</th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                {visibleFields.map((field) => (
                  <td key={field}>{formatCell(config, field, item[field])}</td>
                ))}
                <td className="row-actions">
                  <button type="button" className="icon-button" onClick={() => edit(item)} title="Editar">
                    <Edit3 size={16} />
                  </button>
                  {config.key === 'vehiculos' && (
                    <>
                      <button
                        type="button"
                        className="status-button"
                        onClick={() => changeVehicleStatus(item.id, 'DISPONIBLE')}
                      >
                        Disponible
                      </button>
                      <button
                        type="button"
                        className="status-button"
                        onClick={() => changeVehicleStatus(item.id, 'FUERA_SERVICIO')}
                      >
                        Fuera servicio
                      </button>
                    </>
                  )}
                  <button type="button" className="icon-button danger" onClick={() => remove(item.id)} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={tableFields.length + 2} className="empty">
                  {loading ? 'Cargando...' : 'Sin registros'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {message && (
        <p className="message">
          <Check size={16} />
          {message}
        </p>
      )}
    </section>
  );
}

function App() {
  const [active, setActive] = useState('vehiculos');
  const ActiveIcon = services[active].icon;

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>HCT Alquiler de Vehiculos</h1>
          <p>Frontend React conectado a 3 microservicios WebFlux</p>
        </div>
        <div className="status">
          <ActiveIcon size={20} />
          {services[active].title}
        </div>
      </header>

      <nav className="tabs">
        {Object.entries(services).map(([key, service]) => {
          const Icon = service.icon;
          return (
            <button
              key={key}
              className={active === key ? 'active' : ''}
              type="button"
              onClick={() => setActive(key)}
            >
              <Icon size={18} />
              {service.title}
            </button>
          );
        })}
      </nav>

      <ResourcePanel config={services[active]} />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
