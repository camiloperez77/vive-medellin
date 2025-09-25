import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { createEventFormSchema, type CreateEventFormData } from '../../lib/eventFormValidation';
import { eventService } from '../../services/eventService';
import { useDateTimeFormat } from '../../hooks/useDateTimeFormat';
import type { Event } from '../../types';
import { Button } from '../ui/button';
import { InputField } from '../ui/InputField';
import { SelectField } from '../ui/SelectField';
import { TextareaField } from '../ui/TextareaField';
import { SwitchField } from '../ui/SwitchField';
import { FileUploadField } from '../ui/FileUploadField';
import { CheckboxGroupField } from '../ui/CheckboxGroupField';
import { EVENT_CATEGORIES } from '../../constants/categories';



const modalityOptions = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hibrido', label: 'Híbrido' }
];

const serviciosAdicionalesOptions = [
  { value: 'sonido', label: 'Sonido' },
  { value: 'iluminacion', label: 'Iluminación' },
  { value: 'escenarios', label: 'Escenarios' },
  { value: 'audiovisuales', label: 'Audiovisuales' },
  { value: 'decoracion', label: 'Decoración' },
  { value: 'mobiliario', label: 'Mobiliario' },
  { value: 'catering', label: 'Catering' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'vajilla', label: 'Vajilla y mantelería' },
  { value: 'carpas', label: 'Carpas' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'control_acceso', label: 'Control de acceso' },
  { value: 'ambulancia', label: 'Ambulancia o servicio médico' },
  { value: 'coordinador', label: 'Coordinador de eventos' },
  { value: 'dj', label: 'DJ' },
  { value: 'animadores', label: 'Animadores' },
  { value: 'artistas', label: 'Artistas en vivo' },
  { value: 'generadores', label: 'Generadores eléctricos' },
  { value: 'climatizacion', label: 'Climatización' },
  { value: 'musica_vivo', label: 'Música en vivo' },
  { value: 'fotografia', label: 'Fotografía' },
  { value: 'video', label: 'Video' },
  { value: 'transporte', label: 'Transporte de invitados' },
  { value: 'alojamiento', label: 'Alojamiento' },
  { value: 'seguro', label: 'Seguro de responsabilidad civil' },
  { value: 'invitaciones', label: 'Invitaciones' },
  { value: 'branding', label: 'Branding y señalización' },
  { value: 'experiencias', label: 'Experiencias inmersivas' },
  { value: 'actividades', label: 'Actividades interactivas' },
  { value: 'accesibilidad', label: 'Acceso para personas con movilidad reducida' }
];

export const CreateEventForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getMinDate } = useDateTimeFormat();
  
  // Estados para modo edición
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [eventToEdit, setEventToEdit] = React.useState<Event | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      categoria: '',
      modalidad: 'presencial',
      destacado: false,
      serviciosAdicionales: []
    }
  });

  const modalidadValue = watch('modalidad');

  // Detectar si estamos en modo edición
  React.useEffect(() => {
    if (id && window.location.pathname.includes('/editar-evento/')) {
      setIsEditMode(true);
      loadEventForEdit(id);
    }
  }, [id]);

  // Cargar evento para editar
  const loadEventForEdit = async (eventId: string) => {
    try {
      setIsLoadingEvent(true);
      const event = await eventService.getEventById(eventId);
      setEventToEdit(event);
      
      // Verificar si el evento ya pasó (no se puede editar)
      const eventDate = new Date(event.fecha);
      const currentDate = new Date();
      
      if (eventDate < currentDate) {
        alert('❌ No se puede editar un evento cuya fecha ya ha pasado.');
        navigate(`/eventos/${eventId}`);
        return;
      }
      
      // Precargar datos del formulario
      preloadFormData(event);
      
    } catch (error) {
      console.error('Error al cargar evento para editar:', error);
      alert('❌ Error al cargar el evento para editar.');
      navigate('/eventos');
    } finally {
      setIsLoadingEvent(false);
    }
  };

  // Precargar datos del formulario
  const preloadFormData = (event: Event) => {
    // Convertir fecha al formato correcto
    const eventDate = new Date(event.fecha);
    const formattedDate = eventDate.toISOString().split('T')[0];
    
    setValue('titulo', event.titulo);
    setValue('descripcion', event.descripcion);
    setValue('categoria', event.categoria);
    setValue('fechaInicio', formattedDate);
    setValue('horaInicio', event.horario);
    setValue('modalidad', event.modalidad);
    setValue('aforo', event.aforo?.toString() || '');
    setValue('valorIngreso', event.valor_ingreso === 'gratuito' ? 'Gratuito' : event.valor_ingreso.toString());
    setValue('destacado', event.destacado || false);
    
    // Ubicación
    setValue('comunaBarrio', event.ubicacion.comuna_barrio || '');
    setValue('direccionDetallada', event.ubicacion.direccion_detallada || '');
    setValue('enlaceMapa', event.ubicacion.enlace_mapa || '');
    
    // Organizador
    setValue('nombreOrganizador', event.organizador.nombre);
    setValue('emailOrganizador', event.organizador.email);
    setValue('celularOrganizador', event.organizador.celular || '');
    setValue('identificacionOrganizador', event.organizador.identificacion || '');
    
    // Servicios adicionales
    setValue('serviciosAdicionales', event.servicios_adicionales || []);
  };

  // Cancelar función específica
  const handleCancelFunction = async (funcionIndex: number) => {
    if (!eventToEdit || !eventToEdit.funciones) return;
    
    const funcion = eventToEdit.funciones[funcionIndex];
    const confirm = window.confirm(
      `¿Estás seguro de que quieres cancelar la Función #${funcion.numero_funcion}?\n` +
      `Fecha: ${new Date(funcion.fecha).toLocaleDateString('es-CO')} a las ${funcion.horario}\n\n` +
      `Esta acción no se puede deshacer y se notificará a los usuarios que hayan interactuado con este evento.`
    );
    
    if (!confirm) return;
    
    try {
      // Actualizar función como cancelada
      const updatedFunctions = [...eventToEdit.funciones];
      updatedFunctions[funcionIndex] = {
        ...funcion,
        status: 'cancelled' as any,
        cancelled_at: new Date().toISOString(),
        cancelled_by: 'admin1' // En un futuro esto vendría del contexto de usuario
      };
      
      // Actualizar el evento con las funciones modificadas
      await eventService.updateEvent(eventToEdit.id, {
        funciones: updatedFunctions,
        updated_at: new Date().toISOString(),
        last_edited_by: 'admin1',
        last_edited_at: new Date().toISOString()
      });
      
      // Actualizar el estado local
      const updatedEvent = { ...eventToEdit, funciones: updatedFunctions };
      setEventToEdit(updatedEvent);
      
      alert(`✅ Función #${funcion.numero_funcion} cancelada exitosamente.\n🔔 Se ha enviado notificación a los usuarios.`);
      
    } catch (error) {
      console.error('Error al cancelar función:', error);
      alert('❌ Error al cancelar la función. Por favor intenta nuevamente.');
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es muy grande. Máximo 5MB.');
      }
      
      // Crear nombre único para el archivo
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `evento_${timestamp}_${randomStr}.${extension}`;
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('image', file);
      formData.append('fileName', fileName);
      
      // En desarrollo, usamos una simulación
      console.log('📸 Imagen seleccionada:', {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type,
        newFileName: fileName
      });
      
      // Mostrar mensaje al usuario
      alert(`✅ Imagen "${file.name}" procesada correctamente.\n📁 Se guardará como: ${fileName}`);
      
      // Retornar la ruta donde se guardaría la imagen
      return `/assets/images/eventos/${fileName}`;
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return '/assets/images/eventos/default.jpg';
    }
  };

  const onSubmit = async (data: CreateEventFormData) => {
    try {
      // Validaciones adicionales para modo edición
      if (isEditMode) {
        // Validar que la fecha no sea anterior a la fecha actual
        const eventDate = new Date(data.fechaInicio);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
        
        if (eventDate < currentDate) {
          alert('❌ No se puede programar un evento en una fecha pasada.');
          return;
        }
        
        // Validar campos requeridos específicos para edición
        const requiredFields = [
          { field: data.titulo, name: 'Título del evento' },
          { field: data.descripcion, name: 'Descripción del evento' },
          { field: data.categoria, name: 'Categoría' },
          { field: data.fechaInicio, name: 'Fecha del evento' },
          { field: data.horaInicio, name: 'Hora de inicio' },
          { field: data.nombreOrganizador, name: 'Nombre del organizador' },
          { field: data.emailOrganizador, name: 'Email del organizador' },
          { field: data.celularOrganizador, name: 'Celular del organizador' }
        ];
        
        const emptyFields = requiredFields.filter(item => !item.field?.toString().trim()).map(item => item.name);
        
        if (emptyFields.length > 0) {
          alert(`❌ Por favor completa los siguientes campos requeridos:\n• ${emptyFields.join('\n• ')}`);
          return;
        }
      }
      // Manejar carga de imagen si existe
      let imagePath = eventToEdit?.imagen_caratula || '/assets/images/eventos/default.jpg';
      
      if (data.imagenCaratula && data.imagenCaratula[0]) {
        const file = data.imagenCaratula[0];
        imagePath = await handleImageUpload(file);
      }

      // Convertir los datos del formulario al formato esperado por la API
      const eventData = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha: data.fechaInicio,
        horario: data.horaInicio,
        categoria: data.categoria as any,
        modalidad: data.modalidad,
        aforo: data.aforo ? parseInt(data.aforo) : 100,
        valor_ingreso: data.valorIngreso.toLowerCase().includes('gratis') || data.valorIngreso.toLowerCase().includes('gratuito') 
          ? 'gratuito' as const 
          : parseFloat(data.valorIngreso.replace(/[^\d]/g, '')) || 0,
        destacado: data.destacado || false,
        ubicacion: {
          direccion_completa: eventToEdit?.ubicacion.direccion_completa || '',
          comuna_barrio: data.comunaBarrio || '',
          direccion_detallada: data.direccionDetallada || '',
          enlace_mapa: data.enlaceMapa || ''
        },
        organizador: {
          nombre: data.nombreOrganizador,
          email: data.emailOrganizador,
          celular: data.celularOrganizador || '',
          identificacion: data.identificacionOrganizador || ''
        },
        servicios_adicionales: (data.serviciosAdicionales || []) as any[],
        imagen_caratula: imagePath
      };

      let result;
      if (isEditMode && eventToEdit) {
        // Modo edición
        result = await eventService.updateEvent(eventToEdit.id, eventData);
        console.log('Evento actualizado:', result);
        alert('✅ ¡Evento actualizado exitosamente!');
      } else {
        // Modo creación
        result = await eventService.createEvent(eventData);
        console.log('Evento creado:', result);
        alert('✅ ¡Evento creado exitosamente!');
      }
      
      // Navegar a la página de detalles del evento
      const eventId = isEditMode ? eventToEdit!.id : result.data.id;
      navigate(`/eventos/${eventId}`);
      
    } catch (error) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} evento:`, error);
      alert(`❌ Hubo un error al ${isEditMode ? 'actualizar' : 'crear'} el evento. Por favor intenta nuevamente.`);
    }
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los datos.')) {
      reset();
      navigate('/eventos');
    }
  };

  // Mostrar indicador de carga si se está cargando el evento
  if (isLoadingEvent) {
    return (
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      {/* Título dinámico */}
      <div className="mb-8">
        <h1 className="font-h-1 text-slate-900 mb-2">
          {isEditMode ? `📝 Editar Evento: ${eventToEdit?.titulo || 'Cargando...'}` : '✨ Crear Nuevo Evento'}
        </h1>
        <p className="font-p text-slate-600">
          {isEditMode 
            ? 'Modifica los campos que desees actualizar. Los cambios se registrarán automáticamente.'
            : 'Completa todos los campos para crear un evento que será visible para toda la comunidad.'
          }
        </p>
        {isEditMode && eventToEdit && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Evento creado:</strong> {new Date(eventToEdit.created_at).toLocaleString('es-CO')}
              {eventToEdit.last_edited_at && (
                <>
                  <br />
                  <strong>Última edición:</strong> {new Date(eventToEdit.last_edited_at).toLocaleString('es-CO')} 
                  por {eventToEdit.last_edited_by || 'Administrador'}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Información Básica del Evento */}
        <section className="space-y-6">
          <h2 className="font-h-2 text-slate-900 border-b pb-2">
            Información Básica del Evento
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              id="titulo"
              label="Título del Evento"
              placeholder="Ej: Concierto de Rock en Vivo"
              register={register}
              error={errors.titulo}
              required
            />
            
            <SelectField
              id="categoria"
              label="Categoría"
              options={EVENT_CATEGORIES}
              register={register}
              error={errors.categoria}
              required
              placeholder="Selecciona una categoría"
            />
          </div>

          <TextareaField
            id="descripcion"
            label="Descripción"
            placeholder="Describe tu evento: qué incluye, qué pueden esperar los asistentes..."
            register={register}
            error={errors.descripcion}
            required
            rows={4}
            maxLength={1000}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <FileUploadField
              id="imagenCaratula"
              label="Imagen de Carátula"
              accept="image/*"
              register={register}
              error={errors.imagenCaratula as any}
              description="Se guardará en /public/assets/images/eventos/ - Formato: JPG, PNG o WebP (máx. 5MB)"
            />

            <SwitchField
              id="destacado"
              label="Evento Destacado"
              description="Los eventos destacados aparecen en la página principal (máximo 3 eventos destacados en el sistema)."
              register={register}
              error={errors.destacado}
            />
          </div>
        </section>

        {/* Fecha y Hora */}
        <section className="space-y-6">
          <h2 className="font-h-2 text-slate-900 border-b pb-2">
            Fecha y Hora del Evento
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="fechaInicio" className="block font-subtitle text-slate-900">
                Fecha del Evento
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="fechaInicio"
                type="date"
                min={getMinDate()}
                {...register('fechaInicio')}
                className={`
                  w-full px-3 py-2 border rounded-md shadow-sm 
                  font-p text-slate-900
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.fechaInicio ? 'border-red-500' : 'border-gray-300'}
                `}
              />
              {errors.fechaInicio && (
                <p className="text-red-500 font-subtle text-sm">
                  {errors.fechaInicio.message}
                </p>
              )}
            </div>
            
            <InputField
              id="horaInicio"
              label="Hora de Inicio"
              type="time"
              register={register}
              error={errors.horaInicio}
              required
            />
            
            <InputField
              id="horaFin"
              label="Hora de Fin"
              type="time"
              register={register}
              error={errors.horaFin}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Funciones:</strong> Al asignar una fecha y horario, se genera automáticamente un número de función. 
                  Esto permite organizar varias funciones del mismo evento en diferentes horarios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ubicación del Evento */}
        <section className="space-y-6">
          <h2 className="font-h-2 text-slate-900 border-b pb-2">
            Ubicación del Evento
          </h2>
          
          <SelectField
            id="modalidad"
            label="Modalidad"
            options={modalityOptions}
            register={register}
            error={errors.modalidad}
            required
          />

          {(modalidadValue === 'presencial' || modalidadValue === 'hibrido') && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  id="comunaBarrio"
                  label="Comuna o Barrio"
                  placeholder="Ej: Comuna 10, El Poblado"
                  register={register}
                  error={errors.comunaBarrio}
                  required
                />
                
                <InputField
                  id="direccionDetallada"
                  label="Dirección Detallada"
                  placeholder="Ej: Calle 41 #57-30, Teatro Pablo Tobón Uribe"
                  register={register}
                  error={errors.direccionDetallada}
                  required
                />
              </div>

              <InputField
                id="enlaceMapa"
                label="Enlace al Mapa de Ubicación"
                type="url"
                placeholder="https://maps.google.com/..."
                register={register}
                error={errors.enlaceMapa}
              />
            </>
          )}

          {(modalidadValue === 'virtual' || modalidadValue === 'hibrido') && (
            <InputField
              id="enlaceVirtual"
              label="Enlace Virtual"
              type="url"
              placeholder="https://zoom.us/... o https://meet.google.com/..."
              register={register}
              error={errors.enlaceVirtual}
              required
            />
          )}
        </section>

        {/* Información del Evento */}
        <section className="space-y-6">
          <h2 className="font-h-2 text-slate-900 border-b pb-2">
            Información Adicional del Evento
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              id="aforo"
              label="Aforo (Número estimado de personas)"
              type="text"
              placeholder="Ej: 100"
              register={register}
              error={errors.aforo}
            />
            
            <InputField
              id="valorIngreso"
              label="Valor del Ingreso"
              type="text"
              placeholder="Ej: Gratuito, $15000, $20000"
              register={register}
              error={errors.valorIngreso}
              required
            />
          </div>

          <InputField
            id="sitioWeb"
            label="Sitio Web del Evento (opcional)"
            type="url"
            placeholder="https://..."
            register={register}
            error={errors.sitioWeb}
          />
        </section>

        {/* Información del Organizador */}
        <section className="space-y-6">
          <h2 className="font-h-2 text-slate-900 border-b pb-2">
            Información del Organizador
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              id="nombreOrganizador"
              label="Nombre del Organizador o Entidad"
              placeholder="Ej: Juan Pérez o Fundación Cultural"
              register={register}
              error={errors.nombreOrganizador}
              required
            />
            
            <InputField
              id="celularOrganizador"
              label="Número de Celular"
              type="tel"
              placeholder="300 123 4567"
              register={register}
              error={errors.celularOrganizador}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              id="identificacionOrganizador"
              label="Identificación"
              placeholder="Número de cédula o NIT"
              register={register}
              error={errors.identificacionOrganizador}
              required
            />
            
            <InputField
              id="emailOrganizador"
              label="Correo Electrónico"
              type="email"
              placeholder="organizador@email.com"
              register={register}
              error={errors.emailOrganizador}
              required
            />
          </div>
        </section>

        {/* Servicios Adicionales */}
        <section className="space-y-6">
          <h2 className="font-h-2 text-slate-900 border-b pb-2">
            Servicios Adicionales (Opcional)
          </h2>
          
          <CheckboxGroupField
            id="serviciosAdicionales"
            label="Selecciona los servicios que incluye tu evento:"
            options={serviciosAdicionalesOptions}
            register={register}
            error={errors.serviciosAdicionales as any}
            description="Marca todos los servicios que estarán disponibles en tu evento."
            columns={3}
          />
        </section>

        {/* Gestión de Funciones - Solo en modo edición */}
        {isEditMode && eventToEdit?.funciones && eventToEdit.funciones.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-h-2 text-slate-900 border-b pb-2">
              Gestión de Funciones del Evento
            </h2>
            
            <div className="grid gap-4">
              {eventToEdit.funciones.map((funcion, index) => {
                const funcionDate = new Date(funcion.fecha);
                const currentDate = new Date();
                const isPast = funcionDate < currentDate;
                const isCancelled = funcion.status === 'cancelled';
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 border rounded-lg ${
                      isCancelled 
                        ? 'border-red-300 bg-red-50' 
                        : isPast 
                          ? 'border-gray-300 bg-gray-50' 
                          : 'border-green-300 bg-green-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={isCancelled ? 'line-through text-gray-500' : ''}>
                        <h3 className="font-medium text-gray-900">
                          Función #{funcion.numero_funcion}
                        </h3>
                        <p className="text-sm text-gray-600">
                          📅 {new Date(funcion.fecha).toLocaleDateString('es-CO')} a las {funcion.horario}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          isCancelled 
                            ? 'bg-red-200 text-red-800' 
                            : isPast 
                              ? 'bg-gray-200 text-gray-800' 
                              : 'bg-green-200 text-green-800'
                        }`}>
                          {isCancelled 
                            ? '❌ Cancelada' 
                            : isPast 
                              ? '✅ Realizada' 
                              : '📅 Programada'
                          }
                        </span>
                      </div>
                      
                      {!isPast && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelFunction(index)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Cancelar Función
                        </button>
                      )}
                    </div>
                    
                    {isCancelled && (
                      <div className="mt-2 text-xs text-red-600">
                        Cancelada el: {funcion.cancelled_at ? new Date(funcion.cancelled_at).toLocaleString('es-CO') : 'No especificado'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Las funciones que ya pasaron no se pueden editar. 
                    Solo puedes cancelar funciones futuras. Los usuarios que hayan interactuado con funciones canceladas recibirán una notificación.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Información Complementaria */}
        <section className="space-y-6">
          <h2 className="font-h-2 text-slate-900 border-b pb-2">
            Información Complementaria
          </h2>
          
          <TextareaField
            id="requisitos"
            label="Requisitos o Recomendaciones"
            placeholder="Ej: Traer cédula, edad mínima 18 años, vestimenta casual, llegar 30 minutos antes..."
            register={register}
            error={errors.requisitos}
            rows={4}
            maxLength={500}
          />
        </section>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 sm:flex-none sm:px-8 ${
              isEditMode 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting 
              ? (isEditMode ? 'Guardando Cambios...' : 'Creando Evento...') 
              : (isEditMode ? '💾 Guardar Cambios' : '✨ Crear Evento')
            }
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 sm:flex-none sm:px-8"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};