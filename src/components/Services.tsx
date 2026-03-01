import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Workflow, MessageSquare, BarChart3, Shield, Zap } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Bot,
      title: "AI Chatbots & Assistants",
      description: "Intelligent conversational AI that handles customer inquiries, lead qualification, and support tickets 24/7.",
      features: ["Natural language processing", "Multi-platform integration", "Custom training"],
    },
    {
      icon: Workflow,
      title: "Process Automation",
      description: "Streamline complex workflows and eliminate manual tasks with smart automation solutions.",
      features: ["Workflow optimization", "System integrations", "Real-time monitoring"],
    },
    {
      icon: MessageSquare,
      title: "Communication Automation",
      description: "Automate email marketing, social media posting, and customer communications at scale.",
      features: ["Email sequences", "Social media automation", "Customer follow-ups"],
    },
    {
      icon: BarChart3,
      title: "Data Analytics & Insights",
      description: "Transform raw data into actionable insights with AI-powered analytics and reporting.",
      features: ["Predictive analytics", "Custom dashboards", "Automated reporting"],
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Ensure accuracy and compliance with automated testing and quality control systems.",
      features: ["Automated testing", "Compliance monitoring", "Error detection"],
    },
    {
      icon: Zap,
      title: "Integration & Optimization",
      description: "Seamlessly connect your existing tools and optimize performance for maximum efficiency.",
      features: ["API integrations", "Performance optimization", "Scalable architecture"],
    },
  ];

  return (
    <section id="services" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Comprehensive AI Automation Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From intelligent chatbots to complete workflow automation, we deliver solutions 
            that transform how your business operates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="glass-card hover-lift group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground mb-4 text-base leading-relaxed">
                  {service.description}
                </CardDescription>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;