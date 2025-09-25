import { format, parseISO, isValid, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha en formato dd/mm/yyyy
 */
export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'dd/MM/yyyy', { locale: es });
  } catch {
    return '';
  }
};

/**
 * Formatea una hora en formato HH:mm AM/PM
 */
export const formatTime = (time: string): string => {
  try {
    // Asume que el tiempo viene en formato HH:mm
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours, 10);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return `${hour12}:${minutes} ${period}`;
  } catch {
    return time;
  }
};

/**
 * Convierte fecha y hora en un objeto Date
 */
export const combineDateAndTime = (date: string, time: string): Date => {
  const [day, month, year] = date.split('/');
  const [hours, minutes] = time.split(':');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
};

/**
 * Valida si una fecha es futura
 */
export const isFutureDateTime = (date: string, time: string): boolean => {
  try {
    const eventDateTime = combineDateAndTime(date, time);
    return isAfter(eventDateTime, new Date());
  } catch {
    return false;
  }
};

/**
 * Valida formato de fecha dd/mm/yyyy
 */
export const isValidDateFormat = (date: string): boolean => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(date)) return false;
  
  const [day, month, year] = date.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return dateObj.getFullYear() === year &&
         dateObj.getMonth() === month - 1 &&
         dateObj.getDate() === day;
};

/**
 * Valida formato de hora HH:mm
 */
export const isValidTimeFormat = (time: string): boolean => {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};

/**
 * Convierte un precio a formato colombiano
 */
export const formatCurrency = (amount: number | "gratuito"): string => {
  if (amount === "gratuito") return "Gratuito";
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Trunca texto a un número específico de caracteres
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Genera un ID único
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Valida email
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida número de celular colombiano
 */
export const isValidColombianPhone = (phone: string): boolean => {
  const regex = /^3[0-9]{9}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};