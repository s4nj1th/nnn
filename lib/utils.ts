import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function relu(x: number): number {
  return Math.max(0, x);
}

export function tanh(x: number): number {
  return Math.tanh(x);
}

export function softmax(values: number[]): number[] {
  const maxVal = Math.max(...values);
  const exps = values.map((v) => Math.exp(v - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export function applyActivation(
  value: number,
  activation: string,
  allValues?: number[]
): number {
  switch (activation) {
    case 'relu':
      return relu(value);
    case 'sigmoid':
      return sigmoid(value);
    case 'tanh':
      return tanh(value);
    case 'linear':
      return value;
    case 'softmax':
      if (allValues) {
        const sm = softmax(allValues);
        const idx = allValues.indexOf(value);
        return idx >= 0 ? sm[idx] : sigmoid(value);
      }
      return sigmoid(value);
    default:
      return value;
  }
}

export function getWeightColor(weight: number, isDark = true): string {
  if (weight >= 0) {
    return isDark ? 'hsl(48 100% 52%)' : 'hsl(47 96% 47%)';
  }
  return isDark ? 'hsl(0 84% 60%)' : 'hsl(0 72% 51%)';
}

export function getWeightThickness(weight: number): number {
  const abs = Math.abs(weight);
  return clamp(abs * 3, 1, 6);
}

export function getActivationColor(value: number): string {
  const clamped = clamp(value, 0, 1);
  const hue = lerp(220, 48, clamped);
  return `hsl(${hue} 80% 60%)`;
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}
