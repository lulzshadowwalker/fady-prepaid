import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes intelligently.
 *
 * @param {...ClassValue[]} inputs - An array of class values to be combined.
 * @returns {string} A single string with the combined class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random number within a specified range.
 *
 * @param min - The minimum value of the range (inclusive).
 * @param max - The maximum value of the range (exclusive).
 * @returns A random number between `min` (inclusive) and `max` (exclusive).
 */
export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a unique redemption code.
 *
 * This function creates a UUID, removes the dashes, converts it from hexadecimal to base-36,
 * and then takes the first 10 characters of the resulting string in uppercase.
 *
 * @returns {string} A unique redemption code consisting of 11 uppercase alphanumeric characters.
 */
export function generateRedemptionCode() {
  const uuid = uuidv4().replace(/-/g, '');
  return parseInt(uuid, 16).toString(36).substring(0, 11).toUpperCase();
}
