// Utilidades para manejo de formato de fecha y hora

// Hook para manejar formato de fecha dd/mm/yyyy y hora hh:mm AM/PM
export const useDateTimeFormat = () => {
  // Función para convertir de formato ISO a dd/mm/yyyy
  const formatToDisplayDate = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Función para convertir de dd/mm/yyyy a formato ISO
  const formatToISODate = (displayDate: string): string => {
    if (!displayDate) return '';
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Función para convertir de formato 24h a 12h AM/PM
  const formatTo12Hour = (time24h: string): string => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Función para convertir de 12h AM/PM a formato 24h
  const formatTo24Hour = (time12h: string): string => {
    if (!time12h) return '';
    const [time, ampm] = time12h.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    
    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  // Función para obtener la fecha mínima (hoy)
  const getMinDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Función para validar que la fecha/hora sea futura
  const isFutureDateTime = (date: string, time: string): boolean => {
    if (!date || !time) return false;
    
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    const eventDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    
    return eventDateTime > now;
  };

  return {
    formatToDisplayDate,
    formatToISODate,
    formatTo12Hour,
    formatTo24Hour,
    getMinDate,
    isFutureDateTime
  };
};