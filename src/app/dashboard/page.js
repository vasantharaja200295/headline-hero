"use client";

import { useState, useMemo, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// UI Components
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HEADLINE_CONFIG, TONE_OPTIONS } from "@/utils/constants";
import { calculateReadingTime, calculateCost, countWords } from "@/utils/functions";
import { Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateHeadlines } from "@/lib/gemini";
import { getUser, getCredits, updateCredits } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Form schema - separated for better maintainability
const createFormSchema = () => {
  return z.object({
    content: z.string().min(
      HEADLINE_CONFIG.minContentLength, 
      `Content must be at least ${HEADLINE_CONFIG.minContentLength} characters`
    ),
    numHeadlines: z.number().min(HEADLINE_CONFIG.min).max(HEADLINE_CONFIG.max),
    tone: z.string(),
  });
};

// Component parts
const PageHeader = () => (
  <div>
    <h1 className="text-2xl md:text-3xl font-bold mb-2">Generate Headlines</h1>
    <p className="text-gray-500 mb-6">Generate engaging headlines for your content</p>
  </div>
);

const ContentField = ({ control, name }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-md font-bold">Newsletter Content</FormLabel>
        <FormControl>
          <div className="flex flex-col">
            <Textarea
              placeholder="Paste your newsletter content here..."
              className="min-h-[200px] lg:min-h-[340px] resize-none text-sm"
              {...field}
            />
            <div className="mt-2 text-sm text-gray-500">
              Words: {countWords(field.value)} | Reading time: {calculateReadingTime(field.value)} min
            </div>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const HeadlinesField = ({ control, name, onSliderChange }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>Number of Headlines ({HEADLINE_CONFIG.min}-{HEADLINE_CONFIG.max})</FormLabel>
        <FormControl>
          <Slider
            min={HEADLINE_CONFIG.min}
            max={HEADLINE_CONFIG.max}
            step={1}
            defaultValue={[field.value]}
            onValueChange={(vals) => onSliderChange(vals[0])}
            className="py-4"
          />
        </FormControl>
        <div className="text-sm text-gray-500">
          {field.value} headlines will be generated
        </div>
      </FormItem>
    )}
  />
);

const ToneField = ({ control, name }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>Tone</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a tone" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {TONE_OPTIONS.map((tone) => (
              <SelectItem key={tone.value} value={tone.value}>
                {tone.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
    )}
  />
);

const FormActions = ({ costPerGeneration, availableCredits = 0, isLoading }) => {
  const insufficientCredits = costPerGeneration > availableCredits;
  
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Available Credits:</span>
          <span className={`font-semibold ${insufficientCredits ? 'text-red-500' : ''}`}>
            {availableCredits} credits
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Cost per generation: {costPerGeneration} credits
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || insufficientCredits}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Headlines...
          </>
        ) : insufficientCredits ? (
          "Insufficient Credits"
        ) : (
          "Generate Headlines"
        )}
      </Button>
    </div>
  );
};

const HeadlineCard = ({ headline, index }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(headline);
      setCopied(true);
      toast.success("Headline copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy headline");
    }
  };

  return (
    <div className="relative group border rounded-lg p-4 hover:border-gray-400 transition-all">
      <div className="pr-8"> 
        <p className="text-sm font-medium line-clamp-3">{headline}</p>
      </div>
      <button
        onClick={copyToClipboard}
        className="absolute top-3 right-3 p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="Copy headline"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

const ResultsPanel = ({ headlines = [] }) => {
  const hasHeadlines = headlines.length > 0;

  return (
    <div className="lg:col-span-2 border rounded-lg p-4 lg:p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Generated Headlines</h2>
        {hasHeadlines && (
          <span className="text-sm text-gray-500">
            {headlines.length} headlines generated
          </span>
        )}
      </div>

      {hasHeadlines ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
          {headlines.map((headline, index) => (
            <HeadlineCard key={index} headline={headline} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <p className="text-gray-500 mb-2">Your generated headlines will appear here</p>
          <p className="text-sm text-gray-400">Fill in the form and click Generate Headlines to start</p>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function Dashboard() {
  const router = useRouter();
  const [costPerGeneration, setCostPerGeneration] = useState(HEADLINE_CONFIG.baseCost);
  const [headlines, setHeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const formSchema = useMemo(() => createFormSchema(), []);

  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const user = await getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const credits = await getCredits(user.id);
        setAvailableCredits(credits);
      } catch (error) {
        toast.error('Failed to fetch your credits. Please refresh the page.');
      }
    };

    fetchUserCredits();
  }, [router]);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      numHeadlines: HEADLINE_CONFIG.default,
      tone: TONE_OPTIONS[0].value,
    },
  });

  // Event handlers
  const handleSliderChange = (value) => {
    const newCost = calculateCost(value);
    setCostPerGeneration(newCost);
    form.setValue("numHeadlines", value);
  };

  // Form submission handler
  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      
      // Check user session
      const user = await getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Verify current credits before generation
      const currentCredits = await getCredits(user.id);
      if (!currentCredits || currentCredits < costPerGeneration) {
        throw new Error('Insufficient credits');
      }

      let generatedHeadlines;
      try {
        // Generate headlines
        generatedHeadlines = await generateHeadlines({
          content: values.content,
          numHeadlines: values.numHeadlines,
          tone: values.tone,
        });

        // Validate generated headlines
        if (!Array.isArray(generatedHeadlines) || generatedHeadlines.length === 0) {
          throw new Error('Failed to generate valid headlines');
        }

        // Double check credits before updating to prevent race conditions
        const verifyCredits = await getCredits(user.id);
        if (verifyCredits < costPerGeneration) {
          throw new Error('Insufficient credits');
        }

        // Only update credits after successful generation
        const newCredits = verifyCredits - costPerGeneration;
        const updatedCredits = await updateCredits(user.id, newCredits);
        
        if (!updatedCredits) {
          throw new Error('Failed to update credits');
        }

        // Update UI only after successful credit update
        setHeadlines(generatedHeadlines);
        setAvailableCredits(newCredits);
        toast.success(`Successfully generated ${generatedHeadlines.length} headlines`);
      } catch (error) {
        // If generation or credit update fails, ensure we don't update UI
        setHeadlines([]);
        // Refresh credits display to ensure accuracy
        const refreshedCredits = await getCredits(user.id);
        setAvailableCredits(refreshedCredits);
        throw error; // Re-throw to be caught by outer catch block
      }
    } catch (error) {
      if (error.message === 'Insufficient credits') {
        toast.error('You need more credits to generate headlines');
      } else if (error.message === 'Failed to generate valid headlines') {
        toast.error('Failed to generate headlines. Please try again with different content.');
      } else {
        toast.error(error.message || 'Failed to generate headlines');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-background overflow-auto md:pb-8">
      <div className="container mx-auto lg:p-6 max-w-full">
        <PageHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="border rounded-lg p-4 space-y-4">
                  <ContentField control={form.control} name="content" />
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <HeadlinesField 
                    control={form.control} 
                    name="numHeadlines" 
                    onSliderChange={handleSliderChange} 
                  />
                  <ToneField control={form.control} name="tone" />
                </div>

                <FormActions 
                  costPerGeneration={costPerGeneration}
                  availableCredits={availableCredits}
                  isLoading={isLoading}
                />
              </form>
            </Form>
          </div>

          <ResultsPanel headlines={headlines} />
        </div>
      </div>
    </div>
  );
}