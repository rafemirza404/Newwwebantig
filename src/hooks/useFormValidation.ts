/**
 * useFormValidation Hook
 * Reusable form validation with error handling
 */

import { useState, useCallback } from 'react';
import { validateEmail, validatePhone, validateName } from '@/lib/validation';
import type { LeadData } from '@/types/models';

export type ValidationErrors = Partial<Record<keyof LeadData | 'phoneNumber', string>>;

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateLeadForm = useCallback((
    data: LeadData,
    phoneNumber: string
  ): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate name
    if (!data.name || !validateName(data.name)) {
      newErrors.name = 'Name must be at least 2 characters with valid characters';
    }

    // Validate email
    if (!data.email || !validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // FIX 4: Strict phone number validation - absolutely mandatory
    if (!phoneNumber || phoneNumber.trim() === '') {
      newErrors.phoneNumber = 'Phone number is required to continue';
    } else if (!validatePhone(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (minimum 7 digits)';
    }

    // Validate company
    if (!data.company || data.company.length < 2) {
      newErrors.company = 'Company name is required';
    }

    // Validate role
    if (!data.role) {
      newErrors.role = 'Please select your role';
    }

    // Validate consent
    if (!data.consent) {
      newErrors.consent = 'You must agree to receive follow-up communication';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateEmailInput = useCallback((email: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!email || !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: keyof ValidationErrors) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  return {
    errors,
    validateLeadForm,
    validateEmailInput,
    clearErrors,
    clearError,
  };
};
