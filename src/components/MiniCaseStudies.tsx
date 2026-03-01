import { FileText, Package, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MiniCaseStudies = () => {
  const caseStudies = [
    {
      icon: FileText,
      industry: "Professional Services",
      headline: "8 Hours → 45 Minutes",
      subheadline: "Client Onboarding Transformation",
      body: "A growing consultancy was spending full workdays on manual client onboarding. We automated document collection, contract generation, and CRM updates—now they onboard 10x faster.",
      metric: "93% time saved",
    },
    {
      icon: Package,
      industry: "E-Commerce",
      headline: "15% Complaints → <2%",
      subheadline: "Order Fulfillment Overhaul",
      body: "Order chaos was killing customer trust. We connected their store, inventory, and shipping platforms—eliminating manual errors and creating real-time visibility across the entire fulfillment chain.",
      metric: "87% error reduction",
    },
    {
      icon: GraduationCap,
      industry: "EdTech",
      headline: "60 Hours/Week Reclaimed",
      subheadline: "Student Communication Automation",
      body: "Manual emails and follow-ups were drowning their small team. Our intelligent automation handles 90% of routine student communications while maintaining the personal touch.",
      metric: "60+ hours saved weekly",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-subtle">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real Businesses. Transformative Results.
          </h2>
          <p className="text-lg text-muted-foreground">
            See how we've helped companies like yours escape operational chaos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <Card
              key={index}
              className="bg-card border-border shadow-card hover:shadow-elegant transition-smooth"
            >
              <CardContent className="p-6">
                <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">
                  {study.industry}
                </Badge>
                
                <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center mb-4">
                  <study.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {study.headline}
                </h3>
                <p className="text-lg font-semibold text-muted-foreground mb-4">
                  {study.subheadline}
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {study.body}
                </p>
                <p className="text-2xl font-bold text-accent">
                  {study.metric}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MiniCaseStudies;
