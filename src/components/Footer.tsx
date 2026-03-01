"use client";

import { Mail, MapPin } from "lucide-react";

const agentblueLogo = "/agentblue-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                <img 
                  src={agentblueLogo} 
                  alt="AgentBlue Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold">AgentBlue</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Transforming businesses through strategic automation—not just tools, but operational excellence.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Services</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">AI Chatbots</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Process Automation</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Data Analytics</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Integration Services</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Company</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="/about" className="hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="/services" className="hover:text-primary-foreground transition-colors">Services</a></li>
              <li><a href="/contact" className="hover:text-primary-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact</h3>
            <div className="space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:sophia@supportagentblue.in" className="hover:text-primary-foreground transition-colors">
                  sophia@supportagentblue.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Remote-First Consultancy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 AgentBlue. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;