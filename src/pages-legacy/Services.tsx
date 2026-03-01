import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Bot,
  Workflow,
  BarChart3,
  MessageSquare,
  FileText,
  Shield,
  Target,
  Scale,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  Search,
  DollarSign,
  Map,
  Wrench,
  Rocket,
  Clock,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { CalendarBooking } from "@/components/CalendarBooking";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ScrollIndicator, HorizontalScrollGradient } from "@/components/ScrollIndicator";

const Services = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);

  const capabilities = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Chatbots & Virtual Assistants",
      description: "Intelligent conversational AI that handles customer service, lead qualification, and support 24/7.",
      features: ["Natural Language Processing", "Multi-channel Integration", "Custom Training", "Analytics Dashboard"]
    },
    {
      icon: <Workflow className="w-8 h-8" />,
      title: "Process Automation",
      description: "Streamline repetitive tasks and workflows with intelligent automation solutions.",
      features: ["Workflow Design", "API Integrations", "Task Automation", "Performance Monitoring"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Predictive Analytics",
      description: "Harness AI to forecast trends, predict customer behavior, and make data-driven decisions.",
      features: ["Machine Learning Models", "Real-time Analytics", "Custom Dashboards", "Predictive Insights"]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Processing",
      description: "Automate document analysis, data extraction, and content generation with AI.",
      features: ["OCR Technology", "Data Extraction", "Content Generation", "Document Classification"]
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Customer Communication",
      description: "AI-powered email marketing, social media management, and customer engagement.",
      features: ["Email Automation", "Social Media AI", "Personalization", "Engagement Analytics"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "AI Security & Monitoring",
      description: "Protect your business with AI-driven threat detection and automated security responses.",
      features: ["Threat Detection", "Automated Responses", "Security Analytics", "Compliance Monitoring"]
    }
  ];

  const differentiators = [
    {
      icon: <Search className="w-6 h-6" />,
      badge: "No Exceptions",
      title: "We Diagnose Before We Prescribe",
      description: "Every client—regardless of budget—starts with our Operations Intelligence Audit. We never build without strategy. We never recommend tools without understanding your actual workflows. This isn't negotiable."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Zero Vendor Bias, Ever",
      description: "We don't earn commissions from software vendors. We're not certified in specific platforms. We evaluate what you already own, then recommend additions only when there's a genuine gap—with full ROI justification."
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "You Own Everything We Create",
      description: "Our blueprints and roadmaps are yours forever. Implement with your team, hire freelancers, or let us build it. Total flexibility. Zero lock-in. We win when you succeed, not when you depend on us."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Accountable to Real Business Metrics",
      description: "Every automation is tied to measurable outcomes: time saved, costs reduced, revenue enabled. No vanity metrics. No 'trust us it's working.' Just quantified business impact."
    }
  ];

  const phases = [
    {
      number: "01",
      icon: <Target className="w-6 h-6" />,
      name: "Operational Deep Dive",
      timeline: "Week 1",
      description: "Stakeholder interviews, process mapping, bottleneck identification. We don't just ask what you do—we observe workflows in action to find what's actually broken.",
      activities: ["Workflow shadowing & documentation", "Pain point quantification", "Technology stack audit"]
    },
    {
      number: "02",
      icon: <DollarSign className="w-6 h-6" />,
      name: "Cost & Impact Analysis",
      timeline: "Week 1-2",
      description: "We quantify exactly what manual chaos is costing you: hours wasted, revenue leaked, customer churn from operational failures. Real numbers, not estimates.",
      activities: ["Time-tracking analysis", "Error cost calculations", "Opportunity cost modeling"]
    },
    {
      number: "03",
      icon: <Map className="w-6 h-6" />,
      name: "Strategic Roadmap Creation",
      timeline: "Week 2",
      description: "Prioritized automation opportunities ranked by ROI—not ease. We show you what to automate first, second, and third, with projected payback timelines for each.",
      activities: ["ROI modeling per opportunity", "Platform recommendations", "Phased implementation timeline"]
    },
    {
      number: "04",
      icon: <Wrench className="w-6 h-6" />,
      name: "Blueprint & Build (If Engaged)",
      timeline: "3-10 weeks",
      description: "Tier 2: We create technical blueprints anyone can execute. Tier 3: We build, test, and deploy everything turnkey. Your choice.",
      activities: ["Workflow architecture design", "Integration development", "QA testing & error handling"]
    },
    {
      number: "05",
      icon: <Rocket className="w-6 h-6" />,
      name: "Training, Launch & Optimization",
      timeline: "Final 2 weeks + 30 days post-launch",
      description: "Your team learns to manage the systems. We monitor performance, fix issues, and optimize based on real-world usage. You become autonomous.",
      activities: ["Staff training & documentation", "Performance monitoring", "Continuous optimization"]
    }
  ];

  const stats = [
    { value: "$150K-$500K", label: "Typical annual revenue being lost to missed calls and slow response times", icon: <DollarSign className="w-10 h-10" strokeWidth={1.5} />, description: "Revenue leaking from operational gaps" },
    { value: "60-90%", label: "Of leads currently falling through operational cracks can be recovered", icon: <TrendingUp className="w-10 h-10" strokeWidth={1.5} />, description: "With proper systems in place" },
    { value: "24/7/365", label: "Response time with AI-powered systems", icon: <Clock className="w-10 h-10" strokeWidth={1.5} />, description: "vs 2-3 hour manual response" },
    { value: "3-9 Months", label: "Typical payback period", icon: <BarChart3 className="w-10 h-10" strokeWidth={1.5} />, description: "Based on operational audits we've performed" }
  ];

  const faqs = [
    {
      question: "Do all clients have to start with Tier 1 (Operations Intelligence Audit)?",
      answer: "Yes—no exceptions. Every engagement starts with strategic diagnosis. We've seen too many businesses waste money automating the wrong things. Tier 1 ensures we're solving your actual problems."
    },
    {
      question: "Can we implement the recommendations ourselves, or do we have to use your team?",
      answer: "Total flexibility. Tier 1 gives you a strategic roadmap you can execute yourself or with anyone. Tier 2 provides technical blueprints ANY developer can build from. Tier 3 is if you want us to handle everything turnkey. You own all deliverables—forever. Zero lock-in."
    },
    {
      question: "What if we already know what we want to automate?",
      answer: "We still start with Tier 1. Here's why: what you THINK needs automation often isn't the highest ROI opportunity. Our audit frequently uncovers bigger operational leaks that clients didn't even realize existed. We've never had a client regret the diagnostic phase—it always pays for itself in better prioritization."
    },
    {
      question: "How do you charge for services?",
      answer: "Fixed-scope engagements, not hourly. Tier 1 has a set deliverable and timeline. Tier 2 pricing depends on complexity (number of systems, workflows, integrations). Tier 3 is quoted after we've scoped the work in Tier 2. No surprise bills, no scope creep—everything agreed upfront."
    },
    {
      question: "Do you work with the tools we already have, or do we need to buy new platforms?",
      answer: "We maximize your current stack first. Most businesses already own powerful tools—they just don't know how to connect them properly. We only recommend new platforms when there's a genuine capability gap, and we show you exactly why and how it pays for itself via ROI modeling."
    },
    {
      question: "What if our operations are too complex or unique?",
      answer: "Complexity is where we thrive. The messier your operations, the higher your ROI from our work. Operational patterns are universal—we've automated everything from manufacturing to healthcare. Your workflows might be unique, but the principles of bottleneck elimination and process optimization apply everywhere."
    },
    {
      question: "How long until we see actual ROI from automation?",
      answer: "Quick wins can show results in weeks. Most mid-complexity automations deliver measurable ROI within 3-6 months. During Tier 1, we model expected ROI timelines for each opportunity, so you know what to expect before investing a single dollar in implementation."
    },
    {
      question: "What happens if the automation breaks or stops working?",
      answer: "Tier 3 includes 30-day post-launch support to stabilize everything. We also build error handling, fallback procedures, and monitoring into every automation. Plus your team receives full documentation and training—you're never dependent on us. That said, many clients retain us for ongoing optimization because we become trusted advisors."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          className="py-24 md:py-36 bg-[#EEF4FF] relative overflow-hidden"
          style={{ opacity: heroOpacity }}
        >
          <motion.div className="container mx-auto px-4 max-w-5xl" style={{ scale: heroScale }}>
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 inline-flex items-center gap-2 shadow-sm mb-8"
              >
                🎯 Strategy-First Consulting
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.div>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-black leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                We Don't Sell Automation. We Architect Operational Excellence.
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Three tiers of strategic consulting—from diagnosing operational chaos to delivering turnkey automation that actually works. No vendor lock-in. No cookie-cutter solutions. Just measurable business results.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row items-center gap-4 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button
                  asChild
                  className="bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-lg font-semibold px-8 py-7 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(79,124,255,0.4)] hover:shadow-[0_0_40px_rgba(79,124,255,0.6)]"
                >
                  <Link to="/contact">Start With an Audit <ArrowRight className="ml-2 h-5 w-5 inline" /></Link>
                </Button>
                <a
                  href="#process"
                  className="flex items-center gap-2 text-gray-700 font-semibold text-lg hover:text-black transition-colors duration-200"
                >
                  View Our Process <ArrowRight className="h-5 w-5" />
                </a>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <Link
                  to="/watch-demo"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  See Demo in Action →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* The Problem Section */}
        <section className="py-20 bg-[#F5F8FF]">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-4">Most Automation Fails Because It Starts in the Wrong Place</h2>
                <p className="text-xl text-muted-foreground">You don't have an automation problem. You have a strategy problem.</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Tools Without Strategy",
                    description: "Companies buy platforms first, then figure out implementation. Result? Expensive software sitting unused while manual chaos continues."
                  },
                  {
                    title: "Building What's Easy, Not What Matters",
                    description: "Freelancers automate whatever's simple to build. We prioritize what actually moves your business metrics—ROI first, always."
                  },
                  {
                    title: "Vendor Lock-In Disguised as Consulting",
                    description: "Most 'consultants' push tools they're certified in or earn commissions from. We're platform-agnostic—we recommend what's genuinely best for you."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <Card className="border-0 bg-background h-full hover-lift">
                      <CardContent className="p-8">
                        <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The AgentBlue Difference */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-4">How We're Different: Consulting That Puts Strategy First</h2>
                <p className="text-xl text-muted-foreground">Every engagement follows the same proven methodology</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {differentiators.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <Card className="border-0 bg-[#F5F8FF] h-full">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                            {item.icon}
                          </div>
                          <div>
                            {item.badge && (
                              <Badge variant="secondary" className="mb-2">{item.badge}</Badge>
                            )}
                            <h3 className="text-xl font-bold">{item.title}</h3>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Three-Tier Model */}
        <section className="py-20 bg-[#F5F8FF]">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-4">Three Tiers. One Mission: Fix Operations, Then Automate.</h2>
                <p className="text-xl text-muted-foreground">Choose your entry point—but every path starts with strategic diagnosis</p>
              </motion.div>
              
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Tier 1 */}
                <Card className="border-2 border-accent bg-background relative">
                  <div className="absolute -top-4 left-8 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white text-xl font-bold">
                    1
                  </div>
                  <CardContent className="p-8 pt-12">
                    <Badge className="mb-4">TIER 1</Badge>
                    <h3 className="text-2xl font-bold mb-2">Operations Intelligence Audit</h3>
                    <p className="text-muted-foreground mb-4">Diagnose operational chaos. Quantify the bleeding.</p>
                    <Badge variant="outline" className="mb-6">2 weeks</Badge>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Complete Process Audit - We map every workflow, identify every bottleneck</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Cost Quantification - Exact calculations: where you're losing time & money</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">ROI-Prioritized Roadmap - Opportunities ranked by impact, not ease</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Technology Stack Review - Maximize what you own, add only what's needed</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Strategic Recommendations - Platform-agnostic guidance with zero vendor bias</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6 italic">
                      You receive a detailed strategic roadmap. You can implement yourself, hire anyone to execute it, or engage us for Tier 2 (Blueprint) or Tier 3 (Full Implementation). Totally your choice.
                    </p>

                    <CalendarBooking
                      buttonText="Schedule Diagnostic Call"
                      buttonClassName="w-full mb-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    />
                    
                    <p className="text-xs text-muted-foreground">
                      Perfect for: Businesses unsure where to start, or those burned by failed automation attempts.
                    </p>
                  </CardContent>
                </Card>

                {/* Tier 2 */}
                <Card className="border-0 bg-background relative">
                  <div className="absolute -top-4 left-8 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    2
                  </div>
                  <CardContent className="p-8 pt-12">
                    <Badge className="mb-4" variant="secondary">TIER 2</Badge>
                    <h3 className="text-2xl font-bold mb-2">Automation Infrastructure Blueprint</h3>
                    <p className="text-muted-foreground mb-4">Technical roadmaps any developer can execute.</p>
                    <Badge variant="outline" className="mb-6">3-4 weeks</Badge>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Detailed Workflow Diagrams - Visual blueprints with every integration mapped</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Data Architecture Design - How information flows between systems</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Integration Specifications - API endpoints, webhooks, authentication protocols</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Security & Compliance Framework - Built-in safeguards and audit trails</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Implementation Playbook - Step-by-step execution guide with timelines</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6 italic">
                      You get complete technical documentation. Your in-house team can build it, you can hire freelancers, or you can hand it to us for Tier 3 (turnkey implementation). The blueprint is yours forever.
                    </p>
                    
                    <Button asChild variant="outline" className="w-full mb-4">
                      <Link to="/contact">Discuss Blueprint Needs</Link>
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      Perfect for: Teams with technical capacity but need strategic architecture and design.
                    </p>
                  </CardContent>
                </Card>

                {/* Tier 3 */}
                <Card className="border-0 bg-background relative">
                  <Badge variant="secondary" className="absolute top-4 right-4">Optional</Badge>
                  <div className="absolute -top-4 left-8 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                    3
                  </div>
                  <CardContent className="p-8 pt-12">
                    <Badge className="mb-4" variant="secondary">TIER 3</Badge>
                    <h3 className="text-2xl font-bold mb-2">Turnkey Implementation</h3>
                    <p className="text-muted-foreground mb-4">We build, test, train, and stabilize. You see results.</p>
                    <Badge variant="outline" className="mb-6">8-10 weeks</Badge>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Full Platform Setup - We configure everything from scratch</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Workflow Development - Build automations exactly to blueprint specs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Rigorous Testing & QA - Error handling, fallback procedures, edge cases</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Team Training & Documentation - Your staff learns to manage the system</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">30-Day Post-Launch Support - We stabilize operations and troubleshoot issues</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6 italic">
                      Your automations go live. Your team is trained. We provide 30 days of hands-on support to ensure everything runs smoothly. After that, you're fully autonomous (but we're available if you need us).
                    </p>
                    
                    <Button asChild variant="outline" className="w-full mb-4">
                      <Link to="/contact">Get Full-Service Implementation</Link>
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      Perfect for: Teams without technical resources, or businesses wanting speed-to-value without hiring.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Automation Capabilities */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-4">Automation Capabilities We Deliver Through Our 3-Tier Model</h2>
                <p className="text-xl text-muted-foreground">
                  These are examples of the automation types we architect for clients—delivered through strategic diagnosis, blueprinting, and optional implementation.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {capabilities.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <Card className="border-0 bg-[#F5F8FF] h-full">
                      <CardHeader>
                        <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mb-4 text-white">
                          {service.icon}
                        </div>
                        <CardTitle className="text-xl">{service.title}</CardTitle>
                        <p className="text-muted-foreground">{service.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-accent" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground italic">Delivered via Tier 2 or Tier 3 engagements</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Proven Process */}
        <section id="process" className="py-20 bg-[#F5F8FF]">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-4">Our Proven Methodology: From Chaos to Clarity to Results</h2>
                <p className="text-xl text-muted-foreground">A proven diagnostic framework for identifying revenue leaks in solar and HVAC operations—refined through real client engagements</p>
              </motion.div>

              <div className="space-y-8">
                {phases.map((phase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <Card className="border-0 bg-background">
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-shrink-0">
                            <div className="text-6xl font-bold text-muted-foreground/20 mb-4">{phase.number}</div>
                            <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center text-white">
                              {phase.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-2xl font-bold">{phase.name}</h3>
                              <Badge variant="outline">{phase.timeline}</Badge>
                            </div>
                            <p className="text-muted-foreground mb-4 leading-relaxed">{phase.description}</p>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Key Activities:</p>
                              <ul className="space-y-1">
                                {phase.activities.map((activity, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-accent mt-1">•</span>
                                    <span>{activity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results & Proof */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-4">Real Clients. Measurable Outcomes.</h2>
                <p className="text-xl text-muted-foreground">The kind of results you get when strategy comes before automation</p>
              </motion.div>

              {/* Mobile: Horizontal scroll */}
              <ScrollIndicator />
              <div className="relative">
                <HorizontalScrollGradient />
                <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 mb-12">
                  <div className="flex gap-6 min-w-max">
                    {stats.map((stat, index) => (
                      <Card key={index} className="border-0 bg-[#F5F8FF] text-center w-[280px] flex-shrink-0">
                        <CardContent className="p-8">
                          <div className="text-accent mb-4 flex justify-center">{stat.icon}</div>
                          <div className="text-4xl font-bold mb-2 text-accent">{stat.value}</div>
                          <h3 className="text-sm font-semibold mb-2">{stat.label}</h3>
                          <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop: Grid layout */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <Card className="border-0 bg-[#F5F8FF] text-center h-full">
                      <CardContent className="p-8">
                        <div className="text-accent mb-4 flex justify-center">{stat.icon}</div>
                        <div className="text-4xl font-bold mb-2 text-accent">{stat.value}</div>
                        <h3 className="text-sm font-semibold mb-2">{stat.label}</h3>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <Card className="border-0 bg-accent text-white">
                <CardContent className="p-12 text-center">
                  <h3 className="text-3xl font-bold mb-4">See How We've Transformed Operations</h3>
                  <p className="text-xl mb-6 opacity-90">
                    From 8-hour onboarding processes to 45 minutes. From 15% complaints to under 2%. Real businesses, transformative results.
                  </p>
                  <p className="text-lg mb-8">
                    We've helped 50+ businesses escape operational chaos and achieve measurable ROI through strategic automation.
                  </p>
                  <Button variant="secondary" size="lg" asChild className="bg-white text-accent hover:bg-white/90">
                    <Link to="/contact">Discuss Your Project →</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="py-20 bg-[#F5F8FF]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Built for Solar & HVAC Companies Ready to Scale</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Built for residential solar and HVAC companies doing $1M-$5M annually—where growth is being choked by missed calls, slow response times, and broken follow-up systems.
              </p>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about">Learn more about our ideal clients →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-4">Questions About Our Services? We've Got Answers.</h2>
              </motion.div>
              
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-0 bg-[#F5F8FF] rounded-lg px-6">
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-accent text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Stop Guessing and Start Fixing Operations?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Schedule your Operations Intelligence Audit and get a clear, ROI-ranked roadmap to operational excellence
              </p>
              
              <Card className="bg-white text-foreground mb-8">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">What You'll Get on the Call:</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-left mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Free 15-minute bottleneck assessment</p>
                        <p className="text-sm text-muted-foreground">We'll identify 1-2 quick wins</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">ROI estimation</p>
                        <p className="text-sm text-muted-foreground">Rough calculations on what manual chaos is costing you</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Custom roadmap preview</p>
                        <p className="text-sm text-muted-foreground">See how our 3-tier model would apply to your business</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Platform recommendations</p>
                        <p className="text-sm text-muted-foreground">Initial thoughts on maximizing your current tools</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground">
                    Zero pressure, zero pitch - Just strategic guidance from experienced consultants
                  </p>
                </CardContent>
              </Card>

              <CalendarBooking
                buttonText="Schedule Diagnostic Call"
                buttonClassName="bg-white text-accent hover:bg-white/90 mb-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8"
              />
              
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Platform-Agnostic Recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>You Own All Deliverables</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>No Long-Term Contracts</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;
