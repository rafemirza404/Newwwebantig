import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, TrendingUp, Zap, DollarSign, Check } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Faisal Al-Harbi",
      title: "CEO,  Al-Noor Electronics & IT",
      avatar: "FH",
      content:
        "Good experience overall. They took time to understand our business before suggesting anything. Not the cheapest option but you get what you pay for. Implementation support was helpful.",
      rating: 5,
    },
    {
      name: "Khalid bin Saleh",
      title: "Operations Manager, Zahrat Al Sharq Trading",
      avatar: "KS",
      content:
        "Honestly, the operations audit opened my eyes. I thought we had things under control, but there were issues we kept missing. Their roadmap made sense and we're implementing it step by step.",
      rating: 5,
    },
    {
      name: "Layla Mohammed",
      title: "Marketing Director, Bayt Al Jamal Furniture",
      avatar: "EP",
      content:
        "We were skeptical at first but decided to try the consultation. They spotted inefficiencies in how we handle client inquiries that were costing us leads. Simple fixes, big impact. Worth it.",
      rating: 5,
    },
  ];

  const stats = [
    { number: "$100k+", label: "Annual Savings (Avg. Mid-Size Client)", icon: DollarSign },
    { number: "85%", label: "Time Reclaimed from Manual Tasks", icon: Zap },
    { number: "3-6 mo", label: "Average ROI Timeline", icon: TrendingUp },
    { number: "95%", label: "Error Reduction on Automated Workflows", icon: Check },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Proven Results That Speak</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Don't just take our word for it. See the measurable impact of AI automation.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{stat.number}</div>
                <div className="text-muted-foreground font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">What Our Clients Say</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-card hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <Quote className="w-8 h-8 text-accent mb-4 opacity-60" />

                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Join 30+ businesses already automating with AgentBlue</p>
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-foreground font-semibold ml-2">4.8 out of 5</span>
            <span className="text-muted-foreground ml-1">(23 reviews)</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
