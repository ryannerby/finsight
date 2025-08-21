import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, Home, FileText, Presentation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PptxGenJS from 'pptxgenjs';

interface Slide {
  id: number;
  title: string;
  content: React.ReactNode;
  speakerNotes: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Finsight: AI-Powered Financial Due Diligence",
    content: (
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-primary">Finsight</h1>
          <p className="text-3xl text-muted-foreground">
            AI-Powered Financial Due Diligence
          </p>
        </div>
        <div className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
          Transform months of analysis into minutes with AI
        </div>
        <div className="bg-muted/50 p-6 rounded-lg max-w-2xl mx-auto">
          <p className="text-lg font-medium text-foreground">
            "What if you could evaluate a business deal in 2 minutes instead of 2 weeks?"
          </p>
        </div>
      </div>
    ),
    speakerNotes: "Welcome to Finsight. We're solving a real problem in the SMB acquisition space - financial due diligence that takes too long and costs too much."
  },
  {
    id: 2,
    title: "Why The Problem",
    content: (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4">Why The Problem</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Financial due diligence is like solving a giant puzzle in the dark
          </p>
        </div>
        <div className="grid gap-4 text-left">
          <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-red-700">Time-intensive:</strong> 
              <span className="text-gray-700"> Manual analysis takes 8-20 hours per deal</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-red-700">Error-prone:</strong> 
              <span className="text-gray-700"> Easy to miss red flags in spreadsheet analysis</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-red-700">Expensive:</strong> 
              <span className="text-gray-700"> External consultants cost $5K-$15K per analysis</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-red-700">Late discovery:</strong> 
              <span className="text-gray-700"> Critical issues found after LOI, wasting time/money</span>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
          <p className="text-blue-800 font-medium">
            Think about the last time you had to make a big decision with incomplete information...
          </p>
        </div>
      </div>
    ),
    speakerNotes: "Imagine you're trying to buy a small business. You're excited about the opportunity, but then reality hits - you need to understand the financial health of this company. Right now, financial due diligence is like trying to solve a giant puzzle in the dark. Analysts spend 8-20 hours poring over spreadsheets, looking for red flags, and trying to make sense of numbers that don't always add up. This isn't just about time - it's about money and risk. When you hire external consultants, you're looking at $5,000 to $15,000 per analysis. But the real cost is what happens when you miss something important. Critical issues often surface after you've already signed a letter of intent, wasting months of work and thousands of dollars. Think about the last time you had to make a big decision with incomplete information. That feeling of uncertainty, that fear of missing something important - that's what we're solving. So what if there was a better way?"
  },
  {
    id: 3,
    title: "The Solution",
    content: (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4">The Solution</h2>
          <p className="text-xl text-muted-foreground">
            Instead of weeks of analysis, get the same insights in under 2 minutes
          </p>
        </div>
        <div className="grid gap-4 text-left">
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-green-700">AI-Powered Analysis:</strong> 
              <span className="text-gray-700"> Expert financial analysts working around the clock</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-green-700">Smart Pattern Recognition:</strong> 
              <span className="text-gray-700"> Identifies red flags humans might miss</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-green-700">Instant Metrics:</strong> 
              <span className="text-gray-700"> 15+ key financial ratios in seconds</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-green-700">Traffic Light System:</strong> 
              <span className="text-gray-700"> Clear visual indicators of financial health</span>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <p className="text-green-800 font-medium">
            We don't just calculate numbers. We understand them.
          </p>
        </div>
      </div>
    ),
    speakerNotes: "What if I told you that instead of weeks of analysis, you could get the same insights in under 2 minutes? That's exactly what Finsight delivers. We've built an AI platform that works like having a team of expert financial analysts working around the clock. You simply upload your financial documents - PDFs, Excel files, or CSV data - and our system goes to work immediately. Here's the magic: we don't just calculate numbers. We understand them. Our AI identifies patterns that humans might miss, spots red flags before they become problems, and gives you a clear picture of what you're really buying. Instead of spending hours calculating ratios, you get 15+ key metrics instantly. Instead of wondering if you missed something, you get a traffic light system that shows you exactly where to focus. And instead of static reports, you can ask questions and get answers in real-time. But how does this actually work? Let me show you the technology behind the magic."
  },
  {
    id: 4,
    title: "The Tech Stack (How)",
    content: (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4">The Tech Stack (How)</h2>
          <p className="text-lg text-muted-foreground">
            Built with the same technologies that power the world's most trusted applications
          </p>
        </div>
        <div className="grid gap-4 text-left mb-6">
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-blue-700">Frontend:</strong> 
              <span className="text-gray-700"> React + TypeScript (like building with LEGO blocks)</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-blue-700">Backend:</strong> 
              <span className="text-gray-700"> Node.js + Express (fast and handles multiple users)</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-blue-700">Database:</strong> 
              <span className="text-gray-700"> Supabase/PostgreSQL (same as banks use)</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-blue-700">AI Engine:</strong> 
              <span className="text-gray-700"> Claude API (financial expert that never sleeps)</span>
            </div>
          </div>
        </div>
        <div className="bg-muted p-6 rounded-lg">
          <h3 className="font-semibold mb-3 text-lg">Why These Choices Matter</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Security:</strong> PostgreSQL is trusted by banks and financial institutions</p>
            <p>• <strong>Reliability:</strong> We do the math ourselves, Claude explains the results</p>
            <p>• <strong>Performance:</strong> Rate limiting and error handling ensure consistent results</p>
          </div>
        </div>
      </div>
    ),
    speakerNotes: "I know what you're thinking - 'This sounds too good to be true.' Let me show you why it's not just possible, but reliable. We've built Finsight using the same technologies that power some of the world's most trusted applications. Our frontend uses React and TypeScript - think of it like building with LEGO blocks that always fit together perfectly. Our backend runs on Node.js and Express, which means it's fast and can handle multiple users at once. Here's why this matters for you: we chose Supabase for our database because it's built on PostgreSQL - the same database that banks and financial institutions trust with their most sensitive data. When we say your financial information is secure, we mean it. For the AI magic, we use Claude API. Think of Claude like having a financial expert who never sleeps, never gets tired, and never makes calculation errors. But here's the key: we don't just trust Claude with the math. We do the calculations ourselves to ensure accuracy, then use Claude to explain what those numbers mean in plain English. We've built in safeguards at every level. Rate limiting means our system handles busy times gracefully. Error handling means you get results even when things go wrong. And our timeout management ensures you never wait more than 90 seconds for an analysis. Now let me walk you through what this looks like in practice."
  },
  {
    id: 5,
    title: "Core Flow / Demo",
    content: (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4">Core Flow / Demo</h2>
          <p className="text-lg text-muted-foreground">
            Here's how the platform works in practice
          </p>
        </div>
        <div className="grid gap-6">
          <div className="flex items-center space-x-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">1</div>
            <div>
              <strong className="text-primary">Upload:</strong> 
              <span className="text-foreground"> Drag and drop financial documents into the system</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">2</div>
            <div>
              <strong className="text-primary">Processing:</strong> 
              <span className="text-foreground"> AI analyzes documents and calculates metrics in under 2 minutes</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">3</div>
            <div>
              <strong className="text-primary">Results:</strong> 
              <span className="text-foreground"> Complete health score with traffic light system and key ratios</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">4</div>
            <div>
              <strong className="text-primary">Q&A & Export:</strong> 
              <span className="text-foreground"> Ask questions and export professional reports</span>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <p className="text-green-800 font-medium">
            Go from "maybe this is a good deal" to "definitely worth pursuing" in under 10 minutes
          </p>
        </div>
      </div>
    ),
    speakerNotes: "Here's how the platform works in practice. Users simply drag their financial documents into our system. Our AI immediately recognizes these as P&L statements, balance sheets, and cash flow data. Within 30 seconds, we extract all the key numbers and start our analysis. In under 2 minutes, users have something that would normally take their team days to create: a complete financial health score, red flag alerts, and key ratios that show the true financial health of the business. But here's where it gets interesting. Users can ask questions like 'What's driving the seasonal revenue patterns?' and get instant answers based on the actual data. They can export professional reports to share with partners. And they can save everything for future reference. Users go from 'maybe this is a good deal' to 'this is definitely worth pursuing' in under 10 minutes. They save themselves weeks of analysis and thousands of dollars in consulting fees. Building something like this taught us some valuable lessons about what works and what doesn't."
  },
  {
    id: 6,
    title: "Lessons Learned",
    content: (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4">Lessons Learned</h2>
          <p className="text-lg text-muted-foreground">
            Building Finsight has been like building a race car while racing it
          </p>
        </div>
        <div className="grid gap-4 text-left">
          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-yellow-700">Do the math yourself:</strong> 
              <span className="text-gray-700"> AI explains, we calculate for accuracy</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-yellow-700">Smart queuing system:</strong> 
              <span className="text-gray-700"> Handles busy times gracefully</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-yellow-700">Universal translator:</strong> 
              <span className="text-gray-700"> Makes all financial formats work together</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-yellow-700">Built-in safeguards:</strong> 
              <span className="text-gray-700"> Error handling ensures you always get results</span>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
          <p className="text-yellow-800 font-medium">
            The biggest lesson: AI is great at explaining, but financial calculations need to be bulletproof
          </p>
        </div>
      </div>
    ),
    speakerNotes: "Building Finsight has been like building a race car while racing it. We've learned some hard lessons, but they've made our product much stronger. Let me dive deep into what we discovered. Our first major lesson came from trying to use AI for everything. We quickly learned that AI is amazing at explaining things and spotting patterns, but when it comes to financial calculations, you need to do the math yourself. Think of it like this: you wouldn't ask a friend to calculate your mortgage payment - you'd use a calculator. We built our own calculator for financial ratios. This approach gives us the best of both worlds. Our calculations are always accurate because we control the math. Our explanations are always clear because Claude can focus on what it does best - making complex financial concepts easy to understand. We also learned that the Claude API has limits, just like any service. So we built a smart queuing system that handles busy times gracefully. When lots of people are using Finsight, our system automatically manages the load so everyone gets their results quickly. The biggest lesson? Financial data comes in many different formats, and each company organizes their books differently. We built a system that can handle this chaos and turn it into clean, comparable data. It's like having a universal translator for financial statements. So where do we go from here? Let me show you what's next."
  },
  {
    id: 7,
    title: "What's Next?",
    content: (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4">What's Next?</h2>
          <p className="text-lg text-muted-foreground">
            Imagine financial due diligence as simple as checking your email
          </p>
        </div>
        <div className="grid gap-4 text-left">
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-green-700">Interactive Q&A:</strong> 
              <span className="text-gray-700"> Ask "What's the biggest risk?" and get instant answers</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-green-700">Smart Document Search:</strong> 
              <span className="text-gray-700"> AI finds relevant information in your documents</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-green-700">Peer Benchmarking:</strong> 
              <span className="text-gray-700"> Compare to others in the same industry</span>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong className="text-green-700">Mobile Experience:</strong> 
              <span className="text-gray-700"> Evaluate deals anywhere, anytime</span>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h3 className="font-semibold mb-3 text-lg">Our Vision</h3>
          <p className="text-blue-800">
            Make financial due diligence so easy and reliable that it becomes a standard part of every business evaluation
          </p>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 text-center">
          <p className="text-primary font-medium text-lg">
            Finsight isn't just about saving time and money. It's about making better decisions with confidence.
          </p>
        </div>
      </div>
    ),
    speakerNotes: "I want you to imagine a world where financial due diligence is as simple as checking your email. That's where we're headed. We're currently building an interactive Q&A interface that will let you ask questions about any business in natural language. Instead of digging through reports, you'll be able to ask 'What's the biggest risk in this deal?' and get a clear, data-backed answer. We're also implementing what we call RAG - retrieval-augmented generation. This is a fancy way of saying we're teaching our AI to find the most relevant information in your documents and give you answers that are grounded in your actual data, not generic responses. Looking further ahead, we're building peer benchmarking. Imagine being able to see how the company you're evaluating compares to others in the same industry. We're also working on scenario modeling - what happens to this business if interest rates go up? If the economy slows down? And yes, we're making everything mobile-friendly. Because the best deals often happen when you're not at your desk. Our goal is simple: make financial due diligence so easy and reliable that it becomes a standard part of every business evaluation. We want to turn what used to be a barrier into a competitive advantage. Finsight isn't just about saving time and money. It's about making better decisions with confidence. Because when you can see the full picture clearly, you can move faster, negotiate better, and close more deals. Thank you for your time. I'm excited to show you how Finsight can transform your due diligence process."
  }
];

export default function Pitch() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const exportToPowerPoint = async () => {
    try {
      // Create a more detailed HTML structure with better content extraction
      const slideContent = [
        {
          title: "Finsight: AI-Powered Financial Due Diligence",
          subtitle: "Transform months of analysis into minutes with AI",
          content: [
            "What if you could evaluate a business deal in 2 minutes instead of 2 weeks?",
            "AI-powered financial analysis platform",
            "Built for SMB acquisitions and due diligence"
          ]
        },
        {
          title: "Why The Problem",
          subtitle: "Financial due diligence is like solving a giant puzzle in the dark",
          content: [
            "Time-intensive: Manual analysis takes 8-20 hours per deal",
            "Error-prone: Easy to miss red flags in spreadsheet analysis",
            "Expensive: External consultants cost $5K-$15K per analysis",
            "Late discovery: Critical issues found after LOI, wasting time/money"
          ]
        },
        {
          title: "The Solution",
          subtitle: "Instead of weeks of analysis, get the same insights in under 2 minutes",
          content: [
            "AI-Powered Analysis: Expert financial analysts working around the clock",
            "Smart Pattern Recognition: Identifies red flags humans might miss",
            "Instant Metrics: 15+ key financial ratios in seconds",
            "Traffic Light System: Clear visual indicators of financial health"
          ]
        },
        {
          title: "The Tech Stack (How)",
          subtitle: "Built with the same technologies that power the world's most trusted applications",
          content: [
            "Frontend: React + TypeScript (like building with LEGO blocks)",
            "Backend: Node.js + Express (fast and handles multiple users)",
            "Database: Supabase/PostgreSQL (same as banks use)",
            "AI Engine: Claude API (financial expert that never sleeps)"
          ]
        },
        {
          title: "Core Flow / Demo",
          subtitle: "Here's how the platform works in practice",
          content: [
            "1. Upload: Drag and drop financial documents into the system",
            "2. Processing: AI analyzes documents and calculates metrics in under 2 minutes",
            "3. Results: Complete health score with traffic light system and key ratios",
            "4. Q&A & Export: Ask questions and export professional reports"
          ]
        },
        {
          title: "Lessons Learned",
          subtitle: "Building Finsight has been like building a race car while racing it",
          content: [
            "Do the math yourself: AI explains, we calculate for accuracy",
            "Smart queuing system: Handles busy times gracefully",
            "Universal translator: Makes all financial formats work together",
            "Built-in safeguards: Error handling ensures you always get results"
          ]
        },
        {
          title: "What's Next?",
          subtitle: "Imagine financial due diligence as simple as checking your email",
          content: [
            "Interactive Q&A: Ask 'What's the biggest risk?' and get instant answers",
            "Smart Document Search: AI finds relevant information in your documents",
            "Peer Benchmarking: Compare to others in the same industry",
            "Mobile Experience: Evaluate deals anywhere, anytime"
          ]
        }
      ];

      const htmlContent = slideContent.map((slide, index) => `
        <div class="slide" style="page-break-after: always; padding: 40px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
          <h1 style="font-size: 36px; margin-bottom: 20px; color: #2563eb;">${slide.title}</h1>
          <h2 style="font-size: 24px; margin-bottom: 40px; color: #6b7280; font-weight: normal;">${slide.subtitle}</h2>
          <div style="text-align: left; max-width: 800px; margin: 0 auto;">
            ${slide.content.map(item => `<p style="font-size: 18px; margin-bottom: 15px; line-height: 1.5;">• ${item}</p>`).join('')}
          </div>
        </div>
      `).join('');

      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Finsight Pitch Deck</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f8fafc;
            }
            .slide { 
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              margin-bottom: 20px;
            }
            h1 { 
              color: #2563eb; 
              font-weight: 700;
              text-align: center;
            }
            h2 { 
              color: #6b7280; 
              font-weight: 400;
              text-align: center;
            }
            p { 
              color: #374151;
              margin: 0;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      // Create a blob and download
      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'finsight-pitch-deck.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('HTML file downloaded! Here\'s how to import to Google Slides:\n\n1. Open the downloaded HTML file in your browser\n2. Select all content (Ctrl+A / Cmd+A)\n3. Copy (Ctrl+C / Cmd+C)\n4. In Google Slides: Insert > Slides from another presentation\n5. Paste the content\n\nOr use the PDF export for a simpler import process.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try the PDF export instead.');
    }
  };

  const exportToPPTX = async () => {
    try {
      // Create a new PowerPoint presentation
      const pptx = new PptxGenJS();
      
      // Set presentation properties
      pptx.author = 'Finsight Team';
      pptx.company = 'Finsight';
      pptx.title = 'Finsight: AI-Powered Financial Due Diligence';
      pptx.subject = 'Transform months of analysis into minutes with AI';

      // Define slide content
      const slideContent = [
        {
          title: "Finsight: AI-Powered Financial Due Diligence",
          subtitle: "Transform months of analysis into minutes with AI",
          content: [
            "What if you could evaluate a business deal in 2 minutes instead of 2 weeks?",
            "AI-powered financial analysis platform",
            "Built for SMB acquisitions and due diligence"
          ]
        },
        {
          title: "Why The Problem",
          subtitle: "Financial due diligence is like solving a giant puzzle in the dark",
          content: [
            "Time-intensive: Manual analysis takes 8-20 hours per deal",
            "Error-prone: Easy to miss red flags in spreadsheet analysis",
            "Expensive: External consultants cost $5K-$15K per analysis",
            "Late discovery: Critical issues found after LOI, wasting time/money"
          ]
        },
        {
          title: "The Solution",
          subtitle: "Instead of weeks of analysis, get the same insights in under 2 minutes",
          content: [
            "AI-Powered Analysis: Expert financial analysts working around the clock",
            "Smart Pattern Recognition: Identifies red flags humans might miss",
            "Instant Metrics: 15+ key financial ratios in seconds",
            "Traffic Light System: Clear visual indicators of financial health"
          ]
        },
        {
          title: "The Tech Stack (How)",
          subtitle: "Built with the same technologies that power the world's most trusted applications",
          content: [
            "Frontend: React + TypeScript (like building with LEGO blocks)",
            "Backend: Node.js + Express (fast and handles multiple users)",
            "Database: Supabase/PostgreSQL (same as banks use)",
            "AI Engine: Claude API (financial expert that never sleeps)"
          ]
        },
        {
          title: "Core Flow / Demo",
          subtitle: "Here's how the platform works in practice",
          content: [
            "1. Upload: Drag and drop financial documents into the system",
            "2. Processing: AI analyzes documents and calculates metrics in under 2 minutes",
            "3. Results: Complete health score with traffic light system and key ratios",
            "4. Q&A & Export: Ask questions and export professional report"
          ]
        },
        {
          title: "Lessons Learned",
          subtitle: "Building Finsight has been like building a race car while racing it",
          content: [
            "Do the math yourself: AI explains, we calculate for accuracy",
            "Smart queuing system: Handles busy times gracefully",
            "Universal translator: Makes all financial formats work together",
            "Built-in safeguards: Error handling ensures you always get results"
          ]
        },
        {
          title: "What's Next?",
          subtitle: "Imagine financial due diligence as simple as checking your email",
          content: [
            "Interactive Q&A: Ask 'What's the biggest risk?' and get instant answers",
            "Smart Document Search: AI finds relevant information in your documents",
            "Peer Benchmarking: Compare to others in the same industry",
            "Mobile Experience: Evaluate deals anywhere, anytime"
          ]
        }
      ];

      // Create slides
      slideContent.forEach((slide, index) => {
        const pptxSlide = pptx.addSlide();
        
        // Add title
        pptxSlide.addText(slide.title, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 1.5,
          fontSize: 28,
          bold: true,
          color: '2563eb',
          align: 'center'
        });

        // Add subtitle
        pptxSlide.addText(slide.subtitle, {
          x: 0.5,
          y: 2.2,
          w: 9,
          h: 0.8,
          fontSize: 18,
          color: '6b7280',
          align: 'center'
        });

        // Add content bullets
        slide.content.forEach((item, itemIndex) => {
          pptxSlide.addText(item, {
            x: 0.5,
            y: 3.2 + (itemIndex * 0.6),
            w: 9,
            h: 0.5,
            fontSize: 14,
            color: '374151',
            bullet: { type: 'bullet' }
          });
        });
      });

      // Save the presentation
      await pptx.writeFile({ fileName: 'finsight-pitch-deck.pptx' });
      
      alert('PowerPoint file downloaded successfully! You can now:\n\n1. Open the .pptx file in PowerPoint, Google Slides, or any presentation software\n2. Customize the design and layout as needed\n3. Share with your team or stakeholders\n\nNote: The file is fully compatible with PowerPoint, Google Slides, and other presentation software.');
    } catch (error) {
      console.error('PowerPoint export failed:', error);
      alert('PowerPoint export failed. Please try the other export options.');
    }
  };

  const exportToGoogleSlides = () => {
    try {
      // Create a text format optimized for Google Slides import
      const slideText = [
        "SLIDE 1: Finsight: AI-Powered Financial Due Diligence",
        "Transform months of analysis into minutes with AI",
        "",
        "What if you could evaluate a business deal in 2 minutes instead of 2 weeks?",
        "AI-powered financial analysis platform",
        "Built for SMB acquisitions and due diligence",
        "",
        "---",
        "",
        "SLIDE 2: Why The Problem",
        "Financial due diligence is like solving a giant puzzle in the dark",
        "",
        "• Time-intensive: Manual analysis takes 8-20 hours per deal",
        "• Error-prone: Easy to miss red flags in spreadsheet analysis",
        "• Expensive: External consultants cost $5K-$15K per analysis",
        "• Late discovery: Critical issues found after LOI, wasting time/money",
        "",
        "---",
        "",
        "SLIDE 3: The Solution",
        "Instead of weeks of analysis, get the same insights in under 2 minutes",
        "",
        "• AI-Powered Analysis: Expert financial analysts working around the clock",
        "• Smart Pattern Recognition: Identifies red flags humans might miss",
        "• Instant Metrics: 15+ key financial ratios in seconds",
        "• Traffic Light System: Clear visual indicators of financial health",
        "",
        "---",
        "",
        "SLIDE 4: The Tech Stack (How)",
        "Built with the same technologies that power the world's most trusted applications",
        "",
        "• Frontend: React + TypeScript (like building with LEGO blocks)",
        "• Backend: Node.js + Express (fast and handles multiple users)",
        "• Database: Supabase/PostgreSQL (same as banks use)",
        "• AI Engine: Claude API (financial expert that never sleeps)",
        "",
        "---",
        "",
        "SLIDE 5: Core Flow / Demo",
        "Here's how the platform works in practice",
        "",
        "1. Upload: Drag and drop financial documents into the system",
        "2. Processing: AI analyzes documents and calculates metrics in under 2 minutes",
        "3. Results: Complete health score with traffic light system and key ratios",
        "4. Q&A & Export: Ask questions and export professional report",
        "",
        "---",
        "",
        "SLIDE 6: Lessons Learned",
        "Building Finsight has been like building a race car while racing it",
        "",
        "• Do the math yourself: AI explains, we calculate for accuracy",
        "• Smart queuing system: Handles busy times gracefully",
        "• Universal translator: Makes all financial formats work together",
        "• Built-in safeguards: Error handling ensures you always get results",
        "",
        "---",
        "",
        "SLIDE 7: What's Next?",
        "Imagine financial due diligence as simple as checking your email",
        "",
        "• Interactive Q&A: Ask 'What's the biggest risk?' and get instant answers",
        "• Smart Document Search: AI finds relevant information in your documents",
        "• Peer Benchmarking: Compare to others in the same industry",
        "• Mobile Experience: Evaluate deals anywhere, anytime",
        "",
        "Our Vision: Make financial due diligence so easy and reliable that it becomes a standard part of every business evaluation",
        "",
        "Finsight isn't just about saving time and money. It's about making better decisions with confidence."
      ].join('\n');

      // Create and download text file
      const blob = new Blob([slideText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'finsight-pitch-deck-for-google-slides.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Text file downloaded! Here\'s how to import to Google Slides:\n\n1. Open the downloaded .txt file\n2. Copy all content (Ctrl+A / Cmd+A, then Ctrl+C / Cmd+C)\n3. In Google Slides: Insert > Slides from another presentation\n4. Paste the content\n\nThis format is optimized for easy copying and pasting into Google Slides.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try the other export options.');
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const currentSlideData = slides.find(slide => slide.id === currentSlide);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to App</span>
          </Button>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            >
              {showSpeakerNotes ? 'Hide' : 'Show'} Speaker Notes
            </Button>
            <Button onClick={exportToGoogleSlides} className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              Export Text for Google Slides
            </Button>
            <Button onClick={exportToPowerPoint} className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              Export HTML for Google Slides
            </Button>
            <Button onClick={exportToPPTX} className="flex items-center space-x-2">
              <Presentation className="w-4 h-4" />
              Export PowerPoint (.pptx)
            </Button>
            <Button onClick={exportToPDF} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        {/* Slide */}
        <Card className="min-h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {currentSlideData?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-8">
            {currentSlideData?.content}
          </CardContent>
        </Card>

        {/* Speaker Notes */}
        {showSpeakerNotes && (
          <Card className="mt-6 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Speaker Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {currentSlideData?.speakerNotes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {slides.map((slide) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(slide.id)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  slide.id === currentSlide
                    ? 'bg-primary'
                    : 'bg-muted hover:bg-muted-foreground'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={nextSlide}
            disabled={currentSlide === slides.length}
            className="flex items-center space-x-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Slide {currentSlide} of {slides.length}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .slide {
            page-break-after: always;
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  );
}

