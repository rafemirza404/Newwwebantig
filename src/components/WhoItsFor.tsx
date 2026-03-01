import { Briefcase, ShoppingCart, GraduationCap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WhoItsFor = () => {
  const industries = [
    {
      icon: Briefcase,
      title: "Professional Services",
      examples: "Agencies • Consultancies • Law Firms",
      painPoint:
        "Client onboarding chaos, proposal bottlenecks, billable hour tracking nightmares",
      solution: "Automated workflows from first contact to project close",
    },
    {
      icon: ShoppingCart,
      title: "E-Commerce & Retail",
      examples: "Online Stores • D2C Brands • Multi-Channel Sellers",
      painPoint:
        "Order processing chaos, inventory sync issues, customer service overwhelm",
      solution: "End-to-end order automation & real-time inventory intelligence",
    },
    {
      icon: GraduationCap,
      title: "EdTech & Education",
      examples: "Online Courses • Coaching • Training Institutes",
      painPoint:
        "Manual student onboarding, endless email follow-ups, payment tracking mess",
      solution: "Student lifecycle automation from enrollment to certification",
    },
    {
      icon: TrendingUp,
      title: "Financial Services",
      examples: "Advisors • Wealth Management • Fintech",
      painPoint:
        "Compliance bottlenecks, manual reporting, client data scattered everywhere",
      solution: "Compliant automation infrastructure with audit trails built-in",
    },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Built for Businesses That Refuse to Stay Stuck
          </h2>
          <p className="text-lg text-muted-foreground">
            If you're growing fast but operations are lagging, we're built for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {industries.map((industry, index) => (
            <Card
              key={index}
              className="bg-card border-border shadow-card hover-lift"
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center mb-6">
                  <industry.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {industry.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {industry.examples}
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Pain Point:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {industry.painPoint}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      What We Solve:
                    </p>
                    <p className="text-sm text-accent font-medium">
                      {industry.solution}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoItsFor;
