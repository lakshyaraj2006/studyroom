import { useTheme } from "next-themes"
import { Sun, Moon, Laptop } from "lucide-react"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting until mounted on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full opacity-0">
        <Sun size={18} />
      </Button>
    )
  }

  const handleCycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCycleTheme}
      className="relative w-10 h-10 rounded-full hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-foreground cursor-pointer border-2 border-primary/50 shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:shadow-[0_0_18px_rgba(99,102,241,0.45)] dark:border-primary/60 dark:shadow-[0_0_15px_rgba(129,140,248,0.25)] dark:hover:shadow-[0_0_22px_rgba(129,140,248,0.45)]"
      title={`Theme: ${theme}. Click to change.`}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {theme === "light" && <Sun className="h-6 w-6 text-amber-500" />}
        {theme === "dark" && <Moon className="h-6 w-6 text-indigo-400" />}
        {(theme === "system" || theme === undefined) && <Laptop className="h-6 w-6 text-slate-500 dark:text-slate-400" />}
      </div>
    </Button>
  )
}
