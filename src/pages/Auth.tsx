import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/projects",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

export default function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el código de verificación.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch {
      setError("El código introducido no es correcto. Revísalo e inténtalo de nuevo.");
      setOtp("");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch {
      setError("No se pudo acceder como invitado. Prueba con el correo electrónico.");
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Panel técnico */}
      <aside className="relative hidden overflow-hidden bg-sidebar px-12 py-10 text-sidebar-foreground lg:flex lg:flex-col">
        <div className="absolute inset-0 blueprint-dark opacity-70" />
        <div className="absolute -left-24 bottom-0 size-[420px] rounded-full bg-accent/10 blur-3xl" />

        <div className="relative">
          <Brand />
        </div>

        <div className="relative mt-auto mb-auto max-w-md py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-primary">
            REBT · ITC-BT-25
          </p>
          <h1 className="mt-4 text-[34px] font-semibold leading-[1.12] tracking-tight text-white">
            Tus instalaciones, calculadas y documentadas en un solo lugar.
          </h1>
          <p className="mt-4 text-[13px] leading-6 text-white/50">
            Proyectos guardados, circuitos dimensionados y memoria técnica lista
            para entregar. Sin hojas de cálculo sueltas ni valores inventados.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Circuitos C1-C12 con secciones y protecciones coordinadas",
              "Caídas de tensión y puesta a tierra comprobadas",
              "Memoria A4 con fórmulas, tablas y referencias normativas",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[12px] text-white/65">
                <Check className="mt-0.5 size-3.5 shrink-0 text-sidebar-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-[10.5px] text-white/30">
          <ShieldCheck className="size-3.5" />
          No sustituye la verificación en obra ni la firma del técnico competente.
        </p>
      </aside>

      {/* Formulario */}
      <main className="flex flex-col items-center justify-center bg-background px-5 py-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 lg:hidden">
            <Brand tone="dark" />
          </div>

          <div className="surface-card p-7">
            {step === "signIn" ? (
              <>
                <p className="eyebrow">Acceso</p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-tight">
                  Entra en REBT Pro
                </h2>
                <p className="mt-1.5 text-[12.5px] leading-5 text-muted-foreground">
                  Introduce tu correo y te enviaremos un código de acceso. Tu
                  espacio de trabajo es privado.
                </p>

                <form onSubmit={handleEmailSubmit} className="mt-6 space-y-3">
                  <input type="hidden" name="flow" value="signIn" />
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="nombre@estudio.es"
                      className="h-10 pl-9"
                      autoComplete="email"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button type="submit" className="h-10 w-full gap-2" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        Enviar código
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    o
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full gap-2"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <UserRound className="size-4" />
                  Acceso de prueba como invitado
                </Button>

                <p className="mt-4 text-[10.5px] leading-4 text-muted-foreground">
                  El acceso de invitado crea una sesión temporal para probar la
                  herramienta sin configurar el correo.
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setStep("signIn");
                    setOtp("");
                    setError(null);
                  }}
                  className="mb-4 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Usar otro correo
                </button>

                <p className="eyebrow">Verificación</p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-tight">
                  Revisa tu correo
                </h2>
                <p className="mt-1.5 text-[12.5px] leading-5 text-muted-foreground">
                  Hemos enviado un código de 6 dígitos a{" "}
                  <span className="font-medium text-foreground">{step.email}</span>.
                </p>

                <form onSubmit={handleOtpSubmit} className="mt-5 space-y-4">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button
                    type="submit"
                    className="h-10 w-full gap-2"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Verificar y entrar"
                    )}
                  </Button>
                </form>
              </>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-destructive/8 px-3 py-2 text-[11px] leading-4 text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between text-[11px] text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Volver al inicio
            </Link>
            <span>REBT Pro · v1</span>
          </div>
        </div>
      </main>
    </div>
  );
}
