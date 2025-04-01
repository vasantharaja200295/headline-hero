'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { getUser, getCredits, updateCredits } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import PaymentButton from '@/components/PaymentButton'

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: "Starter",
    credits: 50,
    price: 5,
    description: "Perfect for testing and small projects",
    headlines: 150,
    isPopular: false,
  },
  {
    id: 'basic',
    name: "Basic",
    credits: 100,
    price: 10,
    description: "Most popular for regular content creators",
    headlines: 300,
    isPopular: true,
  },
  {
    id: 'pro',
    name: "Pro",
    credits: 200,
    price: 20,
    description: "Best value for power users",
    headlines: 600,
    isPopular: false,
  },
];

const FAQ_ITEMS = [
  {
    question: "How do credits work?",
    answer: "Credits are used to generate headlines. Each generation costs 3 credits and produces 6 unique headlines. The more credits you have, the more headlines you can generate.",
  },
  {
    question: "Do credits expire?",
    answer: "No, your credits never expire. Once purchased, they remain in your account until used.",
  },
  {
    question: "What's your refund policy?",
    answer: "We don't offer refunds for purchased credits, but they never expire so you can use them anytime.",
  },
  {
    question: "Can I share credits between team members?",
    answer: "Currently, credits are tied to individual accounts and cannot be shared or transferred between users.",
  },
];

const PriceTag = ({ price }) => (
  <div className="flex items-baseline gap-1">
    <span className="text-3xl font-bold">${price}</span>
    <span className="text-gray-500">USD</span>
  </div>
);

const PackageCard = ({ pkg, onSuccess, isLoading }) => (
  <Card className={`relative ${pkg.isPopular ? 'border-blue-500 shadow-lg' : ''}`}>
    {pkg.isPopular && (
      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500">
        Most Popular
      </Badge>
    )}
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {pkg.name}
      </CardTitle>
      <CardDescription>{pkg.description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <PriceTag price={pkg.price} />
      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span>{pkg.credits} credits</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span>Generate up to {pkg.headlines} headlines</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span>No expiration</span>
        </li>
      </ul>
    </CardContent>
    <CardFooter>
      <PaymentButton 
        className="w-full"
        amount={pkg.price}
        onSuccess={() => onSuccess(pkg.credits)}
        disabled={isLoading}
      />
    </CardFooter>
  </Card>
);

export default function CreditsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUser();
        if (!userData) {
          router.push('/login');
          return;
        }
        setUser(userData);
        const credits = await getCredits(userData.id);
        setCurrentCredits(credits);
      } catch (error) {
        toast.error('Failed to fetch your account data');
      }
    };

    fetchUserData();
  }, [router]);

  const handlePaymentSuccess = async (selectedPackageCredits) => {
    try {
      setIsLoading(true);
      const newCredits = currentCredits + selectedPackageCredits;
      await updateCredits(user.id, newCredits);
      setCurrentCredits(newCredits);
      toast.success('Credits added successfully!');
    } catch (error) {
      toast.error('Failed to update credits');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-background p-6 overflow-auto">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Purchase Credits</h1>
          <p className="text-gray-500">
            Current balance: <span className="font-semibold">{currentCredits} credits</span>
          </p>
        </div>

        {/* Pricing Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <PackageCard 
              key={pkg.name} 
              pkg={pkg} 
              onSuccess={handlePaymentSuccess}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
