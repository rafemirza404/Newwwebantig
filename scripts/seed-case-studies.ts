/**
 * Seed 20 generic automation case studies into the case_studies table.
 * Run once: npx ts-node scripts/seed-case-studies.ts
 *
 * NOTE: Embeddings require an embedding model API key. Without one, embedding
 * is set to null and RAG falls back to text-based matching.
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CASE_STUDIES = [
  {
    title: "Automated Lead Follow-Up Sequence",
    industry: "General",
    business_function: "sales",
    problem: "Sales reps manually followed up with every new lead via email and phone, taking 3-4 hours daily with inconsistent timing and frequent drop-off.",
    solution: "Implemented automated 7-step email + SMS sequence via GoHighLevel triggered immediately on lead capture from any source. CRM updated automatically at each step.",
    result: "Lead response time dropped from 4 hours to 2 minutes. Conversion rate increased 35%. Sales reps saved 3 hours/day for higher-value activities.",
    tools_used: ["GoHighLevel", "Zapier", "Twilio"],
  },
  {
    title: "AI Chatbot for Website Lead Capture",
    industry: "General",
    business_function: "sales",
    problem: "Website visitors left without engaging. No after-hours coverage meant losing leads outside business hours.",
    solution: "Deployed AI chatbot on website to qualify visitors, capture contact info, answer common questions, and book discovery calls directly into the calendar.",
    result: "After-hours lead capture increased 60%. Chatbot handled 80% of initial inquiries without human involvement. 25 additional qualified leads per month.",
    tools_used: ["Intercom", "Cal.com", "n8n"],
  },
  {
    title: "Automated Invoice Generation and Chasing",
    industry: "General",
    business_function: "finance",
    problem: "Admin staff spent 6 hours/week manually generating invoices from completed jobs and sending payment reminders for overdue accounts.",
    solution: "Connected job management software to accounting platform. Invoices generated automatically on job completion. Automated reminder sequence for overdue invoices at 7, 14, and 30 days.",
    result: "Invoice generation time reduced to zero. Payment collection time reduced from 45 days to 22 days average. Admin saved 6 hours/week.",
    tools_used: ["QuickBooks", "Zapier", "Jobber"],
  },
  {
    title: "Automated Appointment Reminders",
    industry: "Service Business",
    business_function: "customer_onboarding",
    problem: "15% no-show rate on booked appointments. Staff spent 2 hours/day manually calling to confirm appointments the day before.",
    solution: "Automated SMS + email reminder sequence: 48 hours before, 24 hours before, and 2 hours before appointment. One-click reschedule link included.",
    result: "No-show rate dropped from 15% to 3%. Staff freed from 2 hours/day of confirmation calls. Customer satisfaction scores improved.",
    tools_used: ["Calendly", "Twilio", "ActiveCampaign"],
  },
  {
    title: "New Client Onboarding Automation",
    industry: "General",
    business_function: "customer_onboarding",
    problem: "New client onboarding was entirely manual — welcome emails, document requests, account setup, and intro calls all handled separately by different team members with no consistency.",
    solution: "Built automated onboarding workflow: welcome email with portal access on contract sign, automatic document request sequence, progress tracking dashboard, and automated check-in at day 7 and 30.",
    result: "Onboarding time reduced from 2 weeks to 3 days. Client satisfaction at 90 days improved by 40%. Team capacity freed for delivery work.",
    tools_used: ["HubSpot", "PandaDoc", "n8n", "Slack"],
  },
  {
    title: "Social Media Content Scheduling Pipeline",
    industry: "General",
    business_function: "marketing",
    problem: "Marketing coordinator spent 8 hours/week manually creating, formatting, and scheduling social media posts across 4 platforms. Content was inconsistent and often delayed.",
    solution: "Built content pipeline where brief is entered once, AI generates platform-optimised copy for each channel, human approves with one click, and posts schedule automatically across all platforms.",
    result: "Content production time reduced from 8 hours to 90 minutes per week. Posting frequency increased from 3x/week to daily. Engagement up 45%.",
    tools_used: ["Buffer", "ChatGPT", "Make.com", "Airtable"],
  },
  {
    title: "Automated Customer Support Ticket Routing",
    industry: "General",
    business_function: "customer_support",
    problem: "Support manager spent 2 hours/day manually reading, categorising, and assigning incoming support tickets to the right team member.",
    solution: "AI classifier reads each incoming ticket, categorises by type and urgency, routes to appropriate team member, and sends acknowledgment to customer with expected response time.",
    result: "First response time reduced from 4 hours to 15 minutes. Manager saved 2 hours/day. Customer satisfaction scores up 28%.",
    tools_used: ["Zendesk", "OpenAI API", "Zapier"],
  },
  {
    title: "Weekly Reporting Dashboard Automation",
    industry: "General",
    business_function: "data_reporting",
    problem: "Operations manager spent 4 hours every Friday pulling data from 5 different systems, compiling into a spreadsheet, and emailing to leadership.",
    solution: "Connected all data sources via API. Dashboard auto-updates in real time. Weekly summary report generated automatically and emailed to leadership every Friday at 8am.",
    result: "4 hours/week saved. Reports now available in real time vs. one week delayed. Data accuracy improved (no manual copy errors).",
    tools_used: ["Google Looker Studio", "n8n", "Zapier", "Google Sheets"],
  },
  {
    title: "Employee Onboarding Document Automation",
    industry: "General",
    business_function: "hr",
    problem: "HR team spent 6 hours per new hire preparing offer letters, contracts, and onboarding documents manually. High error rate from copy-paste.",
    solution: "Template-based document generation triggered by new hire entry in HRIS. Documents pre-populated with correct data, sent for e-signature automatically. Completed documents filed to correct folder automatically.",
    result: "HR document preparation reduced from 6 hours to 20 minutes per hire. Zero copy-paste errors. New hire experience significantly improved.",
    tools_used: ["BambooHR", "PandaDoc", "Zapier", "Google Drive"],
  },
  {
    title: "Quote-to-Invoice Workflow Automation",
    industry: "Service Business",
    business_function: "operations",
    problem: "When quotes were accepted, staff manually re-entered all quote data into job management system, then again into accounting for invoicing. 45 minutes of double-entry per job.",
    solution: "When quote is accepted in proposal tool, job is automatically created in job management system with all details pre-filled. On job completion, invoice auto-generated in accounting with correct line items.",
    result: "45 minutes of double-entry eliminated per job. At 20 jobs/month, that's 15 hours saved monthly. Zero data entry errors between systems.",
    tools_used: ["Proposify", "Jobber", "QuickBooks", "Zapier"],
  },
  {
    title: "Customer Churn Early Warning System",
    industry: "SaaS / Subscription",
    business_function: "customer_support",
    problem: "Customer success team had no visibility into which customers were at risk of churning until they cancelled. Reactive rather than proactive approach.",
    solution: "Built health score system tracking login frequency, feature usage, support tickets, and NPS. Customers below threshold automatically flagged, success manager notified, and personalised re-engagement sequence triggered.",
    result: "Identified 40 at-risk customers in first month. Saved 12 accounts that would have churned. Reduced monthly churn rate from 5% to 2.8%.",
    tools_used: ["HubSpot", "Mixpanel", "n8n", "Slack"],
  },
  {
    title: "Project Status Update Automation",
    industry: "Agency / Professional Services",
    business_function: "operations",
    problem: "Project managers spent 3 hours/week writing and sending project status updates to clients. Clients frequently emailed asking for updates between formal reports.",
    solution: "Automated weekly status update pulled from project management tool. Client receives formatted update every Monday morning. Client portal shows real-time project status without waiting for manager.",
    result: "3 hours/week freed for project managers. Client 'where are we?' emails reduced by 80%. Client satisfaction scores up 25%.",
    tools_used: ["Asana", "n8n", "Mailchimp"],
  },
  {
    title: "Automated Review Request Sequence",
    industry: "Local Business",
    business_function: "marketing",
    problem: "Business was not systematically collecting Google reviews despite high customer satisfaction. Manual requests were inconsistent and awkward for staff.",
    solution: "Automated review request SMS sent 48 hours after job completion. One-click link to Google review page. Second follow-up sent to non-responders at 7 days.",
    result: "Review collection increased from 2/month to 18/month. Google rating improved from 3.9 to 4.7 stars. Significant increase in organic search visibility.",
    tools_used: ["Twilio", "n8n", "Google Business API"],
  },
  {
    title: "Lead Scoring and Prioritisation System",
    industry: "B2B Sales",
    business_function: "sales",
    problem: "Sales team treated all leads equally regardless of fit or intent signals. High-value leads sat in the same queue as low-quality inquiries.",
    solution: "Built lead scoring model based on company size, industry, engagement signals (email opens, page visits, demo requests), and fit criteria. High-scoring leads automatically routed to senior sales reps immediately.",
    result: "Sales team focused 80% of time on top 20% of leads. Deal close rate increased from 12% to 22%. Average deal size increased as reps focused on right prospects.",
    tools_used: ["HubSpot", "Clearbit", "Zapier"],
  },
  {
    title: "Automated Payroll Data Collection",
    industry: "General",
    business_function: "hr",
    problem: "HR collected timesheets manually by emailing staff at end of each pay period. Chasing late submissions took 4 hours per fortnight.",
    solution: "Digital timesheet system with automated submission reminders sent at day 13 and 14 of pay period. Non-submissions flagged automatically. Data flows directly to payroll system.",
    result: "Timesheet collection time reduced from 4 hours to 30 minutes per fortnight. On-time submission rate improved from 65% to 98%. Payroll processing errors eliminated.",
    tools_used: ["Deputy", "Xero", "Zapier"],
  },
  {
    title: "E-commerce Order Fulfilment Automation",
    industry: "E-commerce",
    business_function: "operations",
    problem: "Orders processed manually — staff checked orders, updated inventory, printed labels, and sent tracking emails one by one. Took 4 hours daily for 50-80 orders.",
    solution: "Orders from Shopify automatically flow to fulfilment system. Inventory updated in real time. Shipping labels generated and printed in batches. Tracking number auto-emailed to customer.",
    result: "Order processing time reduced from 4 hours to 45 minutes daily for same volume. Shipping errors reduced by 90%. Customer tracking queries eliminated.",
    tools_used: ["Shopify", "ShipStation", "Zapier"],
  },
  {
    title: "Automated Proposal Generation",
    industry: "Professional Services",
    business_function: "sales",
    problem: "Creating proposals took 3-4 hours each. Sales reps started from scratch every time despite similar structure. Inconsistent branding and content quality.",
    solution: "Discovery call notes enter templated system. Proposal auto-generated with correct pricing, scope, and terms pre-populated. Sales rep reviews and sends in 20 minutes. CRM updated automatically on send and open.",
    result: "Proposal creation time reduced from 4 hours to 20 minutes. Proposal volume increased 3x. Win rate improved 18% due to faster response time.",
    tools_used: ["PandaDoc", "HubSpot", "n8n"],
  },
  {
    title: "Financial Reconciliation Automation",
    industry: "General",
    business_function: "finance",
    problem: "Finance team spent 8 hours/month manually reconciling bank statements against accounting records and identifying discrepancies.",
    solution: "Bank feeds connected to accounting software. Automated matching rules reconcile 85% of transactions without human review. Exceptions flagged for human review with context.",
    result: "Monthly reconciliation time reduced from 8 hours to 90 minutes. Reconciliation now done weekly instead of monthly, improving cash flow visibility.",
    tools_used: ["Xero", "Dext", "Zapier"],
  },
  {
    title: "Content Performance Reporting Automation",
    industry: "Marketing Agency",
    business_function: "data_reporting",
    problem: "Account managers spent 6 hours/month per client pulling analytics from multiple platforms and compiling into PowerPoint for monthly reviews.",
    solution: "Automated dashboard pulls data from all platforms. Monthly report generated automatically as PDF and emailed to client before review call. Account manager reviews and adds commentary in 30 minutes.",
    result: "Report preparation reduced from 6 hours to 30 minutes per client. At 15 clients, that's 82 hours/month saved. Clients receive reports 3 days earlier.",
    tools_used: ["Google Looker Studio", "Make.com", "Google Analytics", "Meta Ads API"],
  },
  {
    title: "Warranty and Follow-Up Tracking System",
    industry: "Trade / Installation",
    business_function: "customer_support",
    problem: "No system to track warranty periods or schedule follow-up check-ins with past customers. Warranty claims handled ad-hoc with frequent disputes about coverage.",
    solution: "On job completion, warranty start date logged automatically. Automated 6-month and 11-month check-in emails sent to customers. Warranty expiry reminders sent to customer before expiry with renewal offer.",
    result: "Warranty dispute resolution time reduced 60%. 11-month check-in emails converted to renewal revenue at 22% rate. Customer lifetime value increased.",
    tools_used: ["Jobber", "ActiveCampaign", "Zapier"],
  },
];

async function seed() {
  console.log("Seeding case studies...");

  for (const cs of CASE_STUDIES) {
    const { error } = await supabase.from("case_studies").insert({
      workspace_id: null, // platform-wide
      title: cs.title,
      industry: cs.industry,
      business_function: cs.business_function,
      problem: cs.problem,
      solution: cs.solution,
      roi_result: cs.result,
      tools_used: cs.tools_used,
      embedding: null, // Set to null until an embedding model is configured
    });

    if (error) {
      console.error(`Failed to insert "${cs.title}":`, error.message);
    } else {
      console.log(`✓ Inserted: ${cs.title}`);
    }
  }

  console.log("Done! Seeded", CASE_STUDIES.length, "case studies.");
}

seed().catch(console.error);
