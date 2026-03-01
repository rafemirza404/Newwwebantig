"use client";

/**
 * LeadFormModal Component
 * Form for new users to enter their details
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormValidation } from '@/hooks/useFormValidation';
import { COUNTRY_CODES, ROLES } from '@/config/constants';
import type { LeadData } from '@/types/models';

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LeadData) => void;
  initialEmail?: string;
}

export const LeadFormModal = ({
  open,
  onClose,
  onSubmit,
  initialEmail = '',
}: LeadFormModalProps) => {
  const { errors, validateLeadForm } = useFormValidation();

  const [formData, setFormData] = useState<LeadData>({
    name: '',
    email: initialEmail,
    phone: '',
    company: '',
    role: '',
    consent: false,
  });

  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleChange = (field: keyof LeadData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const fullPhone = countryCode + phoneNumber;
    const dataToValidate = { ...formData, phone: fullPhone };

    if (validateLeadForm(dataToValidate, phoneNumber)) {
      onSubmit({
        ...dataToValidate,
        timestamp: Date.now(),
        website_form_filled: true,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Connect with Sophia AI</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Quick details to get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Business Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Business Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.code} ({country.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                placeholder="2025551234"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className={errors.phoneNumber ? 'border-red-500 flex-1' : 'flex-1'}
              />
            </div>
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
            <p className="text-xs text-gray-500">
              Combined: {countryCode} {phoneNumber}
            </p>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              placeholder="Acme Inc."
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className={errors.company ? 'border-red-500' : ''}
            />
            {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Your Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => handleChange('consent', checked as boolean)}
            />
            <label htmlFor="consent" className="text-sm leading-tight cursor-pointer">
              I agree to receive follow-up communication from AgentBlue *
            </label>
          </div>
          {errors.consent && <p className="text-sm text-red-500">{errors.consent}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 bg-[#0066FF] hover:bg-[#0052CC]">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
