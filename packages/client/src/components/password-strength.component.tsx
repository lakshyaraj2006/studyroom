import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import type { SignUpUserCredentials } from "@/interfaces/signup-user-credentials"

type Strength = "weak" | "medium" | "strong"

function getPasswordStrength(password: string): Strength {
  const length = password.length >= 12
  const lower = /[a-z]/.test(password)
  const upper = /[A-Z]/.test(password)
  const number = /\d/.test(password)
  const special = /[^A-Za-z0-9]/.test(password)

  const score = [length, lower, upper, number, special].filter(Boolean).length

  if (score <= 2) return "weak"
  if (score <= 4) return "medium"
  return "strong"
}

function randomFrom(chars: string, length: number): string {
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function generateStrongPassword(): string {
  const lettersLower = "abcdefghijklmnopqrstuvwxyz"
  const lettersUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const digits = "0123456789"
  const midSpecials = "@#$%"
  const endSpecials = "!^&*"

  const startLetters =
    randomFrom(lettersUpper, 1) + randomFrom(lettersLower, 5)

  const includeMidSpecial = Math.random() > 0.5
  const midSpecial = includeMidSpecial
    ? midSpecials[Math.floor(Math.random() * midSpecials.length)]
    : ""

  const numbers = randomFrom(digits, Math.floor(Math.random() * 4) + 2)

  const endSpecial =
    endSpecials[Math.floor(Math.random() * endSpecials.length)]

  return `${startLetters}${midSpecial}${numbers}${endSpecial}`
}

interface PasswordStrengthProps {
  credentials: SignUpUserCredentials
  setCredentials: React.Dispatch<React.SetStateAction<SignUpUserCredentials>>
}

export default function PasswordStrength({
  credentials: { password },
  setCredentials,
}: PasswordStrengthProps) {
  const [showPassword, setShowPassword] = useState(false)

  const strength = password ? getPasswordStrength(password) : null

  const strengthColor =
    strength === "weak"
      ? "bg-red-500"
      : strength === "medium"
      ? "bg-yellow-400"
      : "bg-green-500"

  const strengthWidth =
    strength === "weak"
      ? "w-1/3"
      : strength === "medium"
      ? "w-2/3"
      : "w-full"

  const handleGenerate = () => {
    const generated = generateStrongPassword()
    setCredentials((prev) => ({ ...prev, password: generated }))
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          value={password}
          onChange={(e) =>
            setCredentials((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
        />

        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {strength && (
        <>
          <div className="h-1 w-full bg-muted rounded overflow-hidden">
            <div
              className={`h-full transition-all ${strengthColor} ${strengthWidth}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span
              className={
                strength === "weak"
                  ? "text-red-500"
                  : strength === "medium"
                  ? "text-yellow-500"
                  : "text-green-600"
              }
            >
              {strength.charAt(0).toUpperCase() + strength.slice(1)} password
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
