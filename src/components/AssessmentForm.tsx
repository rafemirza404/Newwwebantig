"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { webhookService } from "@/services/api/webhooks";

const AssessmentForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    challenge: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || formData.name.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name (at least 2 characters)",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!formData.challenge || formData.challenge.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please describe your challenge (at least 10 characters)",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await webhookService.submitContactForm({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: "",
        message: formData.challenge,
        source: 'homepage-assessment-form'
      });

      if (response.data || response.status === 200) {
        toast({
          title: "Success!",
          description: "Thanks! We'll send your custom analysis within 48 hours.",
        });
        setFormData({ name: "", email: "", company: "", challenge: "" });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try emailing us directly at sophia@supportagentblue.in",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white py-20 md:py-28" id="assessment-form">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-black mb-4">
            Get a Personalized Automation Assessment
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 text-center mb-12 leading-relaxed">
            Tell us about your biggest operational challenge. We'll send you a custom analysis within 48 hours.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-base font-medium text-gray-900 mb-2">
                Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-4 text-base focus:border-[#4F7CFF] focus:ring-4 focus:ring-[#4F7CFF]/10 transition-all"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-900 mb-2">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-4 text-base focus:border-[#4F7CFF] focus:ring-4 focus:ring-[#4F7CFF]/10 transition-all"
              />
            </div>

            {/* Company Field */}
            <div>
              <label htmlFor="company" className="block text-base font-medium text-gray-900 mb-2">
                Company
              </label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your Company"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-4 text-base focus:border-[#4F7CFF] focus:ring-4 focus:ring-[#4F7CFF]/10 transition-all"
              />
            </div>

            {/* Challenge Field */}
            <div>
              <label htmlFor="challenge" className="block text-base font-medium text-gray-900 mb-2">
                Challenge *
              </label>
              <Textarea
                id="challenge"
                name="challenge"
                value={formData.challenge}
                onChange={handleChange}
                placeholder="Briefly, what is the primary operational challenge you're hoping to solve?"
                rows={5}
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-4 text-base focus:border-[#4F7CFF] focus:ring-4 focus:ring-[#4F7CFF]/10 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-lg font-semibold px-8 py-7 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-[0_0_30px_rgba(79,124,255,0.4)] hover:shadow-[0_0_40px_rgba(79,124,255,0.6)]"
              >
                {isSubmitting ? "Sending..." : "Get Your Assessment"} <ArrowRight className="ml-2 h-5 w-5 inline" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AssessmentForm;
