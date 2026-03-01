import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Target, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { webhookService } from "@/services/api/webhooks";
import { CalendarBooking } from "@/components/CalendarBooking";

const WatchDemo = () => {
  const { toast } = useToast();

  // Update page title and meta description for SEO
  useEffect(() => {
    document.title = "Watch Demo - AgentBlue AI Voice Agents in Action";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Watch a live 2-minute demo of our AI voice agent handling customer conversations, qualifying prospects, and booking meetings—24/7 without human intervention.');
    }

    return () => {
      document.title = "AgentBlue - AI Automation Solutions for Modern Businesses";
    };
  }, []);

  // Load Wistia video player scripts - optimized for faster loading
  useEffect(() => {
    // Check if scripts already loaded to avoid duplicates
    const existingPlayerScript = document.querySelector('script[src*="wistia.com/player.js"]');
    const existingEmbedScript = document.querySelector('script[src*="aj1zk02ajs.js"]');

    // Load Wistia player script if not already loaded
    let playerScript: HTMLScriptElement | null = null;
    if (!existingPlayerScript) {
      playerScript = document.createElement('script');
      playerScript.src = 'https://fast.wistia.com/player.js';
      playerScript.async = true;
      playerScript.defer = true;
      document.head.appendChild(playerScript);
    }

    // Load Wistia embed script for specific video if not already loaded
    let embedScript: HTMLScriptElement | null = null;
    if (!existingEmbedScript) {
      embedScript = document.createElement('script');
      embedScript.src = 'https://fast.wistia.com/embed/aj1zk02ajs.js';
      embedScript.async = true;
      embedScript.defer = true;
      embedScript.type = 'module';
      document.head.appendChild(embedScript);
    }

    // Add Wistia loading styles with thumbnail preview
    const style = document.createElement('style');
    style.textContent = `
      wistia-player[media-id='aj1zk02ajs']:not(:defined) {
        background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/aj1zk02ajs/swatch');
        display: block;
        filter: blur(5px);
        padding-top: 56.25%;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup scripts and styles on unmount (only if we added them)
      if (playerScript && document.head.contains(playerScript)) {
        document.head.removeChild(playerScript);
      }
      if (embedScript && document.head.contains(embedScript)) {
        document.head.removeChild(embedScript);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (!formData.message || formData.message.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a message (at least 10 characters)",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // FIX ISSUE 2: Use centralized webhookService instead of hardcoded URL
      const response = await webhookService.submitContactForm({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        message: formData.message,
        source: 'watch-demo-page'
      });

      if (response.data || response.status === 200) {
        toast({
          title: "Success!",
          description: "Thanks for your interest! We'll be in touch within 24 hours.",
        });
        setFormData({ name: "", email: "", company: "", phone: "", message: "" });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Video and Key Points */}
      <section className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-8 leading-tight max-w-5xl mx-auto animate-slide-up">
              Watch our AI voice agent qualify leads, handle objections, and book meetings
            </h1>

            <p className="text-xl md:text-2xl text-blue-400 text-center mb-16 max-w-3xl mx-auto">
              See how our AI handles real conversations in under 2 minutes
            </p>

            {/* Video Container - Centered */}
            <div className="max-w-[700px] mx-auto mb-12">
              <div className="relative overflow-hidden shadow-2xl">
                <wistia-player media-id="aj1zk02ajs" aspect="1.7777777777777777"></wistia-player>
              </div>
            </div>

            {/* Key Points - Below Video */}
            <div className="max-w-[700px] mx-auto space-y-6 text-center">
              <div className="flex items-center justify-center gap-5">
                <MessageSquare className="w-8 h-8 text-blue-400 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-xl text-white font-normal">
                  Real Customer Conversations
                </p>
              </div>

              <div className="flex items-center justify-center gap-5">
                <Target className="w-8 h-8 text-blue-400 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-xl text-white font-normal">
                  Natural Language Understanding
                </p>
              </div>

              <div className="flex items-center justify-center gap-5">
                <Calendar className="w-8 h-8 text-blue-400 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-xl text-white font-normal">
                  Seamless Appointment Setting
                </p>
              </div>

              <div className="flex items-center justify-center gap-5">
                <CheckCircle className="w-8 h-8 text-blue-400 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-xl text-white font-normal">
                  24/7 Lead Qualification
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We're Different Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mb-8 animate-fade-in">
              Most Automation Projects Fail. Here's Why We're Different:
            </h2>
            
            <p className="text-xl text-gray-700 text-center mb-12 leading-relaxed max-w-4xl mx-auto">
              The problem isn't tools—it's strategy. Businesses rush to automate before understanding their operations. We diagnose first, design second, build third. Every engagement starts with a comprehensive audit because you can't fix what you don't understand.
            </p>

            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <span className="text-2xl text-green-600 flex-shrink-0">✓</span>
                <p className="text-xl text-gray-800 pt-1">
                  <strong className="font-bold">Strategy before tools</strong> - We audit your operations before recommending solutions
                </p>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl text-green-600 flex-shrink-0">✓</span>
                <p className="text-xl text-gray-800 pt-1">
                  <strong className="font-bold">Platform-agnostic</strong> - No vendor bias, no commissions—just what works best for you
                </p>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl text-green-600 flex-shrink-0">✓</span>
                <p className="text-xl text-gray-800 pt-1">
                  <strong className="font-bold">You own everything</strong> - Blueprints, specs, roadmaps—all yours to implement however you want
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Black CTA Section */}
      <section className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight animate-fade-in">
              Ready to See How This Works for Your Business?
            </h2>
            
            <p className="text-xl md:text-2xl text-white mb-12 leading-relaxed">
              Book a 30-minute strategy call. We'll diagnose your biggest operational bottleneck and show you exactly how to fix it.
            </p>

            <CalendarBooking
              buttonText="Schedule Your Free Call →"
              buttonClassName="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-12 py-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            />

            <p className="text-gray-400 mt-6 text-lg">
              No sales pitch. Just strategic insights.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section - Get Personalized Assessment */}
      <section className="py-20 md:py-32 bg-white" id="assessment-form">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Get a Personalized Automation Assessment
              </h2>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                Tell us about your biggest operational challenge. We'll send you a custom analysis within 48 hours.
              </p>
            </div>

            {/* Assessment Form */}
            <Card className="bg-white border border-gray-200 shadow-xl rounded-2xl">
              <CardContent className="p-8 md:p-10">

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-base font-medium mb-2 text-gray-900">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="text-base py-4"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-base font-medium mb-2 text-gray-900">
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
                      className="text-base py-4"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-base font-medium mb-2 text-gray-900">
                      Company *
                    </label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Company"
                      className="text-base py-4"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-base font-medium mb-2 text-gray-900">
                      Challenge *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your biggest operational challenge..."
                      className="min-h-[120px] text-base"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? "Sending..." : "Get My Free Assessment →"}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    We respond within 48 hours with actionable insights.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WatchDemo;
