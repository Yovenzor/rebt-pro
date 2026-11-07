import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

// El script de index.html deja la clase puesta antes de montar React; así el
// conmutador ya arranca en el estado correcto, sin un salto visual.
const initialDark =
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("dark");

/**
 * Conmutador de tema del espacio de trabajo.
 *
 * La almohadilla es menta (#42E2B8) y se desliza sobre un carril que se tiñe
 * de verde bosque (#0F5743) al activar el modo oscuro. El icono del tema
 * contrario queda visible al otro lado para que se entienda que es un
 * conmutador y no un botón suelto.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme ? resolvedTheme === "dark" : initialDark;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5",
        "transition-[background-color,border-color,box-shadow] duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
        "active:scale-[0.96]",
        isDark
          ? "border-mint/30 bg-forest shadow-[inset_0_0_14px_rgba(66,226,184,0.16)]"
          : "border-white/15 bg-white/[0.07] hover:border-mint/40",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-2 text-white/35 transition-opacity duration-300",
          isDark ? "opacity-0" : "opacity-100",
        )}
      >
        <Moon className="size-3" strokeWidth={2.2} />
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-2 text-mint/50 transition-opacity duration-300",
          isDark ? "opacity-100" : "opacity-0",
        )}
      >
        <Sun className="size-3" strokeWidth={2.2} />
      </span>

      <span
        className={cn(
          "relative z-10 flex size-6 items-center justify-center rounded-full bg-mint text-forest",
          "shadow-[0_1px_5px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDark ? "translate-x-5" : "translate-x-0",
        )}
      >
        <span className="relative flex size-3.5 items-center justify-center">
          <Sun
            className={cn(
              "absolute inset-0 m-auto size-3.5 transition-all duration-300",
              isDark
                ? "-rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100",
            )}
            strokeWidth={2.3}
          />
          <Moon
            className={cn(
              "absolute inset-0 m-auto size-3.5 transition-all duration-300",
              isDark
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-0 opacity-0",
            )}
            strokeWidth={2.3}
          />
        </span>
      </span>
    </button>
  );
}
