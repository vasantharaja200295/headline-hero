"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GiftIcon, Mail, Moon, Sun } from "lucide-react";
import Loader from "@/components/Loader";
import { useTheme } from "next-themes";


export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {theme, setTheme} = useTheme()

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage("Check your email for the magic link!");
      setEmail("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className=" flex flex-col items-center justify-center min-h-screen">
      <Button onClick={toggleTheme} variant="outline" className=' absolute top-5 right-5 p-4 h-10 w-10 rounded-sm'>{theme === 'dark' ? <Moon/> : <Sun/>}</Button>
      <Card className={"max-w-sm w-full shadow-lg "}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Headline Hero</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            AI-Powered Newsletter Headlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-lg font-bold mb-1">
          Welcome 
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Continue with your email
          </CardDescription>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-5">
            <div className=" flex flex-col gap-3">
              <p className="text-md">Email Address</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="border p-2 rounded"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10"
            >
              {loading ? <Loader/> : <span className="flex gap-2 text-md font-medium items-center"><Mail/> Continue with Email</span>}
            </Button>
            {message && <p className=" text-sm text-center">{message}</p>}
          </form>
          <div className=" bg-neutral-100 dark:bg-neutral-800 p-4 box-border rounded-md mt-6 flex flex-row gap-2 items-start">
            <GiftIcon className="h-6 w-6 mt-1" strokeWidth={1.5} />
            <div className="flex flex-col gap-1">
              <p className=" text-[14px] font-semibold">New users get 10 free credits</p>
              <p className=" text-[14px] text-muted-foreground">Perfect for trying out our services</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
