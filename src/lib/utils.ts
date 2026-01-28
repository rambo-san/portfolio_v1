import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr + '-02'); // Add day to avoid timezone shifts
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatDuration(startDate: string, endDate?: string, isCurrent?: boolean) {
  if (!startDate) return '';

  const start = new Date(startDate + '-02');
  const end = isCurrent ? new Date() : (endDate ? new Date(endDate + '-02') : new Date());

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth() + 1; // Inclusive of current month

  if (months <= 0) {
    years--;
    months += 12;
  }

  if (months === 12) {
    years++;
    months = 0;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} mo${months > 1 ? 's' : ''}`);

  return parts.length > 0 ? `(${parts.join(' ')})` : '';
}
