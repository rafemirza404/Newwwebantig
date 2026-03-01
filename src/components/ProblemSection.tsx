import { DollarSign, Link2, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ProblemSection = () => {
  const problems = [
    {
      icon: DollarSign,
      title: "Revenue Leak",
      description:
        "Manual processes eating 15-20 hours per week? That's $4-5k/month in lost productivity for most growing businesses.",
    },
    {
      icon: Link2,
      title: "Tool Chaos",
      description:
        "You've bought platforms that promised magic. Now you have 7 tools that don't talk to each other—and zero ROI.",
    },
    {
      icon: TrendingUp,
      title: "Growth Ceiling",
      description:
        "Hired 3 people to keep up with orders. Still can't scale. Your operations model breaks every time you grow 20%.",
    },
    {
      icon: Clock,
      title: "Founder Bottleneck",
      description:
        "You're still approving invoices, checking inventory, and babysitting workflows. Strategic work? Maybe next quarter.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-subtle">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Business Is Growing. Your Operations Aren't.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sound familiar? You're not alone—and it's costing more than you think.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <Card
              key={index}
              className="bg-card hover-lift border-border shadow-card"
            >
              <CardContent className="pt-6 text-left">
                <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center mb-4">
                  <problem.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
