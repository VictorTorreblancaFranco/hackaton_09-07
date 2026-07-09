import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Car, Check, ChevronDown, Edit3, RefreshCw, Save, Trash2, User, WalletCards, Wrench, X } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './styles.css';

const today = new Date().toISOString().slice(0, 10);

const vehicleModels = {
  Toyota: ['Corolla', 'Yaris', 'Hilux', 'RAV4'],
  Nissan: ['Versa', 'Sentra', 'Kicks', 'Frontier'],
  Hyundai: ['Accent', 'Elantra', 'Tucson', 'Santa Fe'],
  Kia: ['Rio', 'Cerato', 'Sportage', 'Sorento'],
  Chevrolet: ['Onix', 'Tracker', 'Captiva', 'S10'],
  Volkswagen: ['Gol', 'Polo', 'Jetta', 'Tiguan']
};

const services = {
  vehiculos: {
    key: 'vehiculos',
    title: 'Vehiculos',
    icon: Car,
    url: 'http://localhost:8081/api/vehiculos',
    empty: {
      placa: '',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2026,
      color: '',
      precioPorDia: 150,
      estado: 'DISPONIBLE'
    },
    fields: [
      ['placa', 'Placa'],
      ['marca', 'Marca', 'select'],
      ['modelo', 'Modelo', 'select'],
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
      ['clienteId', 'Cliente', 'picker'],
      ['vehiculoId', 'Vehiculo', 'picker'],
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

const relatedUrls = {
  clientes: 'http://localhost:8082/api/clientes',
  vehiculos: 'http://localhost:8081/api/vehiculos'
};

function formatPlate(value) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 6);
}

function formatOnlyLetters(value) {
  return value.replace(/[^A-Za-z ]/g, '');
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return `S/ ${Number(value).toFixed(2)}`;
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00`);
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function formatCell(config, field, value) {
  if (config.moneyFields?.includes(field)) {
    return formatMoney(value);
  }
  return value;
}

function statusLabel(estado) {
  if (estado === 'DISPONIBLE') return 'disponible';
  if (estado === 'FUERA_SERVICIO') return 'fuera de servicio';
  if (estado === 'EN_ALQUILER') return 'en alquiler';
  return estado.toLowerCase();
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
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [openPicker, setOpenPicker] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tableFields = config.tableFields ?? config.fields;
  const visibleFields = useMemo(() => tableFields.map(([key]) => key), [tableFields]);
  const clientesActivos = useMemo(() => clientes.filter((cliente) => cliente.estado === 'ACTIVO'), [clientes]);
  const vehiculosDisponibles = useMemo(
    () => vehiculos.filter((vehiculo) => vehiculo.estado === 'DISPONIBLE' || vehiculo.id === form.vehiculoId),
    [form.vehiculoId, vehiculos]
  );
  const vehiculoSeleccionado = useMemo(
    () => vehiculos.find((vehiculo) => vehiculo.id === Number(form.vehiculoId)),
    [form.vehiculoId, vehiculos]
  );
  const clienteSeleccionado = useMemo(
    () => clientes.find((cliente) => cliente.id === Number(form.clienteId)),
    [form.clienteId, clientes]
  );
  const alquilerIncompleto = config.key === 'alquileres' && (!form.clienteId || !form.vehiculoId);

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

  async function loadRelatedData() {
    if (config.key !== 'alquileres') return;
    try {
      const [clientesResponse, vehiculosResponse] = await Promise.all([
        fetch(relatedUrls.clientes),
        fetch(relatedUrls.vehiculos)
      ]);
      const clientesData = clientesResponse.ok ? await clientesResponse.json() : [];
      const vehiculosData = vehiculosResponse.ok ? await vehiculosResponse.json() : [];
      setClientes(clientesData);
      setVehiculos(vehiculosData);
      setForm((current) => {
        const clienteActual = clientesData.find((cliente) => cliente.id === Number(current.clienteId) && cliente.estado === 'ACTIVO');
        const vehiculoActual = vehiculosData.find((vehiculo) => vehiculo.id === Number(current.vehiculoId) && vehiculo.estado === 'DISPONIBLE');
        const clienteId = clienteActual?.id ?? clientesData.find((cliente) => cliente.estado === 'ACTIVO')?.id ?? '';
        const vehiculoId = vehiculoActual?.id ?? vehiculosData.find((vehiculo) => vehiculo.estado === 'DISPONIBLE')?.id ?? '';
        const vehiculo = vehiculosData.find((item) => item.id === Number(vehiculoId));
        return {
          ...current,
          clienteId,
          vehiculoId,
          fechaFin: addDays(current.fechaInicio || today, current.dias || 1),
          total: vehiculo ? Number(vehiculo.precioPorDia || 0) * Number(current.dias || 1) : current.total
        };
      });
    } catch (error) {
      setClientes([]);
      setVehiculos([]);
    }
  }

  useEffect(() => {
    loadItems();
    loadRelatedData();
  }, [config.url]);

  function buildRentalForm(current, key, type, value) {
    const next = {
      ...current,
      [key]: normalizeValue(type, value)
    };

    const vehiculo = vehiculos.find((item) => item.id === Number(next.vehiculoId));
    if (key === 'dias' || key === 'fechaInicio') {
      next.fechaFin = addDays(next.fechaInicio || today, next.dias || 1);
    }
    if (vehiculo && (key === 'vehiculoId' || key === 'dias')) {
      next.total = Number(vehiculo.precioPorDia || 0) * Number(next.dias || 1);
    }
    return next;
  }

  function changeField(key, type, value) {
    setForm((current) => {
      if (key === 'placa') {
        return { ...current, placa: formatPlate(value) };
      }
      if (key === 'color') {
        return { ...current, color: formatOnlyLetters(value) };
      }
      if (key === 'marca') {
        return {
          ...current,
          marca: value,
          modelo: vehicleModels[value][0]
        };
      }
      if (config.key === 'alquileres') {
        return buildRentalForm(current, key, type, value);
      }
      return {
        ...current,
        [key]: normalizeValue(type, value)
      };
    });
  }

  function selectRentalOption(key, value) {
    changeField(key, 'number', value);
    setOpenPicker(null);
  }

  async function changeVehicleStatus(item, estado) {
    const result = await Swal.fire({
      title: 'Confirmar cambio',
      text: `El vehiculo pasara a ${statusLabel(estado)}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${config.url}/${item.id}/estado?estado=${estado}`, { method: 'PUT' });
      if (!response.ok) throw new Error();
      await loadItems();
      setMessage('Estado actualizado.');
    } catch (error) {
      setMessage('');
      Swal.fire('No permitido', 'El vehiculo tiene un alquiler vigente.', 'warning');
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
    setOpenPicker(null);
    setMessage('');
  }

  async function save(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = config.fields.reduce((next, [key]) => {
        next[key] = form[key];
        return next;
      }, {});
      const response = await fetch(editingId ? `${config.url}/${editingId}` : config.url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error();
      cancel();
      await loadItems();
      await loadRelatedData();
      setMessage(editingId ? 'Registro actualizado.' : 'Registro creado.');
    } catch (error) {
      setMessage('');
    } finally {
      setLoading(false);
    }
  }

  async function remove(item) {
    if (config.key === 'vehiculos' && item.estado === 'EN_ALQUILER') {
      Swal.fire('No permitido', 'El vehiculo tiene un alquiler vigente.', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Confirmar eliminacion',
      text: 'El registro se eliminara.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${config.url}/${item.id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) throw new Error();
      await loadItems();
      setMessage('Registro eliminado.');
    } catch (error) {
      setMessage('');
      Swal.fire('No permitido', 'El registro no se puede eliminar en este momento.', 'warning');
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
            <button type="submit" className="primary-button" disabled={loading || alquilerIncompleto}>
              <Save size={18} />
              Guardar
            </button>
          </div>
        </div>

        <div className="fields">
          {config.fields.map(([key, label, type = 'text']) => (
            <label key={key} className={type === 'picker' ? 'picker-field' : undefined}>
              <span>{label}</span>
              {type === 'picker' && key === 'clienteId' ? (
                <div className="picker-box">
                  <button
                    type="button"
                    className="picker-trigger"
                    onClick={() => setOpenPicker(openPicker === 'clienteId' ? null : 'clienteId')}
                  >
                    <span>
                      <strong>{clienteSeleccionado ? `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos}` : 'Seleccionar cliente'}</strong>
                      <small>{clienteSeleccionado ? `DNI ${clienteSeleccionado.dni}` : 'Clientes activos'}</small>
                    </span>
                    <ChevronDown size={18} />
                  </button>
                  {openPicker === 'clienteId' && (
                    <div className="picker-panel">
                      {clientesActivos.map((cliente) => (
                        <button
                          type="button"
                          key={cliente.id}
                          className={Number(form.clienteId) === cliente.id ? 'picker-card selected' : 'picker-card'}
                          onClick={() => selectRentalOption(key, cliente.id)}
                        >
                          <strong>{cliente.nombres} {cliente.apellidos}</strong>
                          <small>DNI {cliente.dni}</small>
                        </button>
                      ))}
                      {!clientesActivos.length && <p className="empty-inline">Sin clientes activos</p>}
                    </div>
                  )}
                </div>
              ) : type === 'picker' && key === 'vehiculoId' ? (
                <div className="picker-box">
                  <button
                    type="button"
                    className="picker-trigger"
                    onClick={() => setOpenPicker(openPicker === 'vehiculoId' ? null : 'vehiculoId')}
                  >
                    <span>
                      <strong>{vehiculoSeleccionado ? vehiculoSeleccionado.placa : 'Seleccionar vehiculo'}</strong>
                      <small>
                        {vehiculoSeleccionado
                          ? `${vehiculoSeleccionado.marca} ${vehiculoSeleccionado.modelo} - ${formatMoney(vehiculoSeleccionado.precioPorDia)} por dia`
                          : 'Vehiculos disponibles'}
                      </small>
                    </span>
                    <ChevronDown size={18} />
                  </button>
                  {openPicker === 'vehiculoId' && (
                    <div className="picker-panel">
                      {vehiculosDisponibles.map((vehiculo) => (
                        <button
                          type="button"
                          key={vehiculo.id}
                          className={Number(form.vehiculoId) === vehiculo.id ? 'picker-card selected' : 'picker-card'}
                          onClick={() => selectRentalOption(key, vehiculo.id)}
                        >
                          <strong>{vehiculo.placa}</strong>
                          <small>{vehiculo.marca} {vehiculo.modelo}</small>
                          <small>{formatMoney(vehiculo.precioPorDia)} por dia</small>
                        </button>
                      ))}
                      {!vehiculosDisponibles.length && <p className="empty-inline">Sin vehiculos disponibles</p>}
                    </div>
                  )}
                </div>
              ) : type === 'select' ? (
                <select
                  value={form[key]}
                  onChange={(event) => changeField(key, type, event.target.value)}
                  required
                >
                  {(key === 'marca' ? Object.keys(vehicleModels) : vehicleModels[form.marca] ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={(event) => changeField(key, type, event.target.value)}
                  maxLength={key === 'placa' ? 6 : undefined}
                  placeholder={key === 'placa' ? 'ABC12' : undefined}
                  pattern={key === 'placa' ? '.*[A-Z0-9].*' : key === 'color' ? '[A-Za-z ]+' : undefined}
                  min={type === 'number' ? 1 : undefined}
                  readOnly={config.key === 'alquileres' && (key === 'fechaFin' || key === 'total')}
                  required
                />
              )}
              {config.key === 'alquileres' && key === 'total' && vehiculoSeleccionado && (
                <small className="field-help">{formatMoney(vehiculoSeleccionado.precioPorDia)} x {form.dias || 1} dias</small>
              )}
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
                  {config.key === 'vehiculos' && item.estado === 'DISPONIBLE' && (
                    <button
                      type="button"
                      className="icon-button warning"
                      onClick={() => changeVehicleStatus(item, 'FUERA_SERVICIO')}
                      title="Marcar fuera de servicio"
                    >
                      <Wrench size={16} />
                    </button>
                  )}
                  {config.key === 'vehiculos' && item.estado === 'FUERA_SERVICIO' && (
                    <button
                      type="button"
                      className="icon-button success"
                      onClick={() => changeVehicleStatus(item, 'DISPONIBLE')}
                      title="Marcar disponible"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="icon-button danger"
                    onClick={() => remove(item)}
                    title={config.key === 'vehiculos' && item.estado === 'EN_ALQUILER' ? 'Vehiculo en alquiler' : 'Eliminar'}
                    disabled={config.key === 'vehiculos' && item.estado === 'EN_ALQUILER'}
                  >
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
