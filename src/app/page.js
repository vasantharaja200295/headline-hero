import Link from "next/link";
import {
  ArrowRightIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    name: "AI-Powered Generation",
    description:
      "Our advanced AI model creates compelling headlines that drive engagement and improve open rates.",
    icon: SparklesIcon,
  },
  {
    name: "Performance Analytics",
    description:
      "Track the performance of your headlines and optimize your content strategy.",
    icon: ChartBarIcon,
  },
  {
    name: "Time-Saving",
    description:
      "Generate multiple headline variations in seconds, saving hours of manual work.",
    icon: ClockIcon,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-white">
          {/* Hero section */}
          <div className="relative isolate px-6 pt-14 lg:px-8">
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Generate Compelling Newsletter Headlines with AI
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  HeadlineHero uses advanced AI to create engaging headlines
                  that drive higher open rates for your newsletters. Save time
                  and improve engagement with our powerful headline generator.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    href="/signup"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500  focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Get started
                    <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5 inline-block" />
                  </Link>
                  <Link
                    href="/about"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Feature section */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                Faster Headline Creation
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to create better headlines
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                HeadlineHero provides all the tools you need to create
                compelling headlines that drive engagement and improve your
                newsletter's performance.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <feature.icon
                        className="h-5 w-5 flex-none text-indigo-600"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
