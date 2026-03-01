"use client";

import Navigation from "~/components/marketing/Navigation";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CalendarBooking } from "@/components/CalendarBooking";
import { CLIENT_ENV } from "~/lib/env";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const webhookUrl = CLIENT_ENV.webhooks.contactForm;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ firstName: "", lastName: "", email: "", company: "", message: "" });
    } catch (err) {
      console.error("[Contact] Form submission failed:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-[#EEF4FF]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Let&apos;s Talk
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to find out exactly where your business is losing time and
              money? Schedule a free strategy call.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section id="contact-methods" className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              <Card className="text-center p-6">
                <Calendar className="w-8 h-8 text-accent mx-auto mb-4" />
                <h3 className="font-bold mb-2">Book a Call</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  30-minute free strategy session
                </p>
                <CalendarBooking buttonText="Schedule Now" />
              </Card>
              <Card className="text-center p-6">
                <Mail className="w-8 h-8 text-accent mx-auto mb-4" />
                <h3 className="font-bold mb-2">Email Us</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {CLIENT_ENV.app.contactEmail}
                </p>
                <a href={`mailto:${CLIENT_ENV.app.contactEmail}`}>
                  <Button variant="outline" size="sm">
                    Send Email
                  </Button>
                </a>
              </Card>
              <Card className="text-center p-6">
                <MessageCircle className="w-8 h-8 text-accent mx-auto mb-4" />
                <h3 className="font-bold mb-2">Quick Message</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use the form below
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document
                      .getElementById("contact-form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Write a Message <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Card>
            </div>

            {/* Contact Form */}
            <div id="contact-form" className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              firstName: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              lastName: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, email: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            company: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            message: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#4F7CFF] text-white rounded-full"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
