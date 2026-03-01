/**
 * Validation and Sanitization Utilities
 * Input validation and sanitization for security and data integrity
 */

/**
 * Sanitize string input by trimming and removing potentially dangerous characters
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic validation)
 */
export const validatePhone = (phone: string): boolean => {
  // Allow +, digits, spaces, dashes, parentheses
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

/**
 * Validate name (at least 2 characters, letters, spaces, and common characters)
 */
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-'.]{2,}$/;
  return nameRegex.test(name);
};

/**
 * Sanitize and validate form data
 */
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
};
