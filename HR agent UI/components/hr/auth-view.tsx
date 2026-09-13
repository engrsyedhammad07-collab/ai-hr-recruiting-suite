"use client"

import { useState } from "react"
import {
  BrainCircuit,
  Check,
  Eye,
  EyeOff,
  Github,
  Chrome,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { SessionUser } from "@/lib/hr-types"

interface AuthViewProps {
  onAuthenticated: (user: SessionUser) => void
}

type Mode = "signin" | "signup"

export function AuthView({ onAuthenticated }: AuthViewProps) {
  const [mode, setMode] = useState<Mode>("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("recruiter")
  const [error, setError] = useState<string | null>(null)

  function validate() {
    if (mode === "signup" && name.trim().length < 2) return "Please enter your full name."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid professional email."
    if (password.length < 6) return "Password must be at least 6 characters."
    return null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setSubmitting(true)
    setTimeout(() => {
      onAuthenticated({
        name: mode === "signup" && name ? name : email.split("@")[0].replace(/[._]/g, " "),
        email,
        role,
      })
    }, 900)
  }

  function handleSso(provider: string) {
    setSubmitting(true)
    setTimeout(() => {
      onAuthenticated({
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.sso`,
        role: "recruiter",
      })
    }, 900)
  }

  const roleLabels: Record<string, string> = {
    recruiter: "Recruiter",
    hiring_manager: "Hiring Manager",
    admin: "Talent Admin",
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
      {/* Brand panel */}
      <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-10 text-white lg:flex lg:w-[44%]">
        <div
          className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 opacity-30 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-inset ring-white/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight">HR Intelligence Suite</span>
        </div>

        <div className="relative max-w-md space-y-6">
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
            Hire with the conviction that comes from evidence, not gut feel
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-white/75">
            Evaluate every candidate against your own job descriptions with deep semantic matching,
            screen entire applicant pools in a single batch, and keep every role consistent from one
            central, version-controlled repository — so the shortlist you defend is the shortlist you
            trust.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              "Instant single-candidate fit scoring",
              "High-throughput batch screening with retry handling",
              "Version-controlled job description library",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/85">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/20">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-white/60">
          <ShieldCheck className="h-4 w-4" />
          SOC 2 aligned · Encrypted candidate data at rest
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-white">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">HR Intelligence Suite</span>
          </div>

          <div className="mb-6 inline-flex rounded-lg border bg-muted p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin")
                setError(null)
              }}
              className={cn(
                "rounded-md px-5 py-1.5 text-sm font-medium transition-colors",
                mode === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup")
                setError(null)
              }}
              className={cn(
                "rounded-md px-5 py-1.5 text-sm font-medium transition-colors",
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-6">
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-xs font-semibold uppercase tracking-wider text-transparent">
              Recruitment Workspace
            </span>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {mode === "signin" ? "Welcome back — let's find your next great hire" : "Create your account and start hiring smarter"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to pick up your candidate pipeline exactly where you left it."
                : "Set up your workspace in under a minute and screen your first batch today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Professional email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {mode === "signin" && (
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                  Remember me for 30 days
                </Label>
              </div>
            )}

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              or continue with
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" disabled={submitting} onClick={() => handleSso("Google")}>
              <Chrome className="h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" type="button" disabled={submitting} onClick={() => handleSso("GitHub")}>
              <Github className="h-4 w-4" />
              GitHub SSO
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New to the suite? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin")
                setError(null)
              }}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
