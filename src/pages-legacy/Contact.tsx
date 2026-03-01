import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, MessageCircle, Globe, Zap, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { webhookService } from "@/services/api/webhooks";
import { CalendarBooking } from "@/components/CalendarBooking";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    details: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (!fullName || fullName.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.details || formData.details.length < 10) {
      toast({
        title: "Validation Error",
        description: "Message must be at least 10 characters",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // FIX ISSUE 2: Use centralized webhookService instead of hardcoded URL
      const response = await webhookService.submitContactForm({
        name: fullName,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        message: formData.details,
        source: 'contact-page'
      });

      if (response.data || response.status === 200) {
        toast({
          title: "Success!",
          description: "Thanks for reaching out! We'll get back to you within 48 hours.",
        });
        setFormData({ firstName: "", lastName: "", email: "", company: "", phone: "", details: "" });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please email us at sophia@supportagentblue.in",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const scrollToContactMethods = () => {
    const element = document.getElementById('contact-methods');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToContactForm = () => {
    const element = document.getElementById('contact-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 md:py-36 bg-[#EEF4FF]">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 inline-flex items-center gap-2 shadow-sm mb-8"
              >
                Free 30-min diagnostic call
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.div>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-black leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Ready to Fix Operations the Right Way?
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Schedule your free 30-minute diagnostic call and discover what's really holding your business back—no sales pitch, just strategic guidance.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CalendarBooking
                  buttonText="Schedule Free Consultation"
                  buttonClassName="bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-lg font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(79,124,255,0.4)] hover:shadow-[0_0_40px_rgba(79,124,255,0.6)] inline-flex items-center gap-2"
                />
                <button
                  onClick={scrollToContactForm}
                  className="flex items-center gap-2 text-gray-700 font-semibold text-lg hover:text-black transition-colors duration-200"
                >
                  Send a message <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>
              <motion.p
                className="text-sm text-gray-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                No sales pitch—just strategic guidance from experienced consultants.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section id="contact-methods" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <h2 className="text-4xl font-bold mb-4">Choose Your Preferred Way to Connect</h2>
                <p className="text-xl text-muted-foreground">We're a remote-first consultancy serving clients globally</p>
              </motion.div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0 }}
                >
                  <Card className="border-2 border-accent bg-accent/5 h-full">
                    <CardHeader>
                      <Badge className="w-fit mb-2">Most Popular</Badge>
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4 text-white">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-2xl">Schedule Free Consultation</CardTitle>
                      <p className="text-muted-foreground">Book a 30-minute diagnostic call with our strategists</p>
                    </CardHeader>
                    <CardContent>
                      <CalendarBooking
                        buttonText="Book Free Call"
                        buttonClassName="w-full bg-accent hover:bg-accent/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8"
                      />
                      <p className="text-sm text-muted-foreground text-center mt-2">No sales pitch—just operational insights</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 text-accent">
                        <Mail className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-2xl">Email</CardTitle>
                      <p className="text-muted-foreground">Get detailed responses to your questions</p>
                    </CardHeader>
                    <CardContent>
                      <a href="mailto:sophia@supportagentblue.in">
                        <Button variant="outline" size="lg" className="w-full mb-2">sophia@supportagentblue.in</Button>
                      </a>
                      <p className="text-sm text-muted-foreground text-center">Response within 48 hours</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 text-accent">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-2xl">Live Chat</CardTitle>
                      <p className="text-muted-foreground">Get instant AI-powered responses</p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full mb-2"
                        onClick={() => {
                          const chatButton = document.querySelector('[aria-label="Open chat support"]') as HTMLButtonElement;
                          if (chatButton) {
                            chatButton.click();
                          } else {
                            console.error('Chat button not found');
                          }
                        }}
                      >
                        Chat Now
                      </Button>
                      <p className="text-sm text-muted-foreground text-center">Available 24/7</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact-form" className="py-20 bg-[#F5F8FF]">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-12">
                <motion.div
                  className="lg:col-span-3"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-3xl">Send Us a Message</CardTitle>
                      <p className="text-muted-foreground">Tell us about your operational challenges and we'll get back to you within 48 hours.</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input 
                              id="firstName" 
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="John"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input 
                              id="lastName" 
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Doe"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input 
                            id="email" 
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@company.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Company *</Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Your Company Name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone (optional)</Label>
                          <Input 
                            id="phone" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="details">Project Details *</Label>
                          <Textarea 
                            id="details" 
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            placeholder="Tell us about your operational challenges..." 
                            className="min-h-[120px]"
                            required
                          />
                        </div>
                        <Button 
                          size="lg" 
                          className="w-full"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">✓ No spam. We respect your privacy.</p>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  className="lg:col-span-2 space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Our Approach</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-accent mt-1" />
                        <div>
                          <p className="font-medium">Remote-First Consultancy</p>
                          <p className="text-sm text-muted-foreground">Serving clients globally via remote consultation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-accent mt-1" />
                        <div>
                          <p className="font-medium">Response within 48 hours</p>
                          <p className="text-sm text-muted-foreground">We'll review your inquiry and get back quickly</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-accent text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Prefer to Schedule Directly?</h2>
            <p className="text-xl mb-8 opacity-90">Book your free 30-minute consultation now</p>
            <CalendarBooking
              buttonText="Schedule Free Call"
              buttonClassName="bg-white text-primary hover:bg-white/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8"
            />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
