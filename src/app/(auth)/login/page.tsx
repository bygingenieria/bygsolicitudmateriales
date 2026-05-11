"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HardHat, ArrowLeft, Loader2, AlertCircle, KeyRound, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// --- DEFINICIÓN DE SCHEMAS ---
const loginSchema = z.object({
  correo: z.string().min(1, "El correo es obligatorio").email("El formato del correo no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

const resetSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  
  nuevaPassword: z.string()
    .min(6, "Mínimo 6 caracteres")
    .refine(
      (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(val),
      "Debe tener mín. 6 caracteres, 1 mayúscula, 1 minúscula y 1 número."
    ),
});

type LoginForm = z.infer<typeof loginSchema>;
type ResetForm = z.infer<typeof resetSchema>;
type AuthView = "LOGIN" | "RECOVER_EMAIL" | "RECOVER_RESET";

export default function LoginPage() {
  const router = useRouter();
  const loginToStore = useAuthStore((state) => state.login);
  
  const [view, setView] = useState<AuthView>("LOGIN");
  const [loading, setLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: errorsReset } } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  // --- LÓGICA LOGIN LIMPIA Y CONECTADA AL BACKEND ---
  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      // ✅ El servicio ya nos devuelve los datos limpios y traducidos
      const response = await authService.login(data.correo, data.password);

      if (response.token) {
        // Guardamos en Zustand
        loginToStore(response);

        // 🎉 Ahora el nombre dirá "Ronaldo Zamorano" y el rol "Administrador"
        toast.success(`¡Bienvenido, ${response.usuario}!`, {
            description: `Has ingresado como ${response.rol}`
        });

        // Redirección por roles
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // Leemos el mensaje de error que manda el backend Identity o AuthController
        const msg = error.response?.data?.error || error.response?.data?.mensaje || "Credenciales incorrectas";
        toast.error(msg);
      } else {
        toast.error("Error de conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
    
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail || !recoveryEmail.includes("@")) return toast.error("Por favor ingresa un correo válido");

    setLoading(true);
    try {
      await authService.requestPasswordReset(recoveryEmail);
      toast.success("Si el correo existe, recibirás un código.");
      setView("RECOVER_RESET");
    } catch (error) { 
        toast.error("Error al procesar la solicitud."); 
    } 
    finally { setLoading(false); }
  };

  const handleResetPassword = async (data: ResetForm) => {
    setLoading(true);
    try {
      await authService.resetPassword({ correo: recoveryEmail, codigo: data.codigo, nuevaPassword: data.nuevaPassword });
      toast.success("Contraseña actualizada exitosamente.");
      setView("LOGIN");
    } catch (error: unknown) { 
      if (error instanceof AxiosError) {
        const backendError = error.response?.data;
        
        // 1. Si Identity nos manda el texto del error exacto
        if (typeof backendError === "string") {
          toast.error(backendError);
        } 
        // 2. Si nos manda un JSON estructurado con un mensaje
        else if (backendError?.mensaje || backendError?.error) {
          toast.error(backendError.mensaje || backendError.error);
        } 
        // 3. Fallback genérico
        else {
          toast.error("Código inválido o expirado.");
        }
      } else {
        toast.error("Error al cambiar la contraseña");
      }
    } finally { 
      setLoading(false); 
    }
  };

  const primaryColor = "#D32F2F";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
      </div>

      <div className="absolute top-8 left-8">
        <Link href="/"><Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 gap-2"><ArrowLeft className="w-4 h-4" /> Volver al Inicio</Button></Link>
      </div>

      <div className="w-full max-w-md px-4 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8"><img src="https://res.cloudinary.com/dsljo0xlb/image/upload/v1768940307/LOGO-BYG_BLANCO-PNG_zdbhuy.png" alt="Logo ByG" className="h-16 w-auto object-contain opacity-90" /></div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm transition-all duration-300">
          
          {view === "LOGIN" && (
            <div className="animate-in slide-in-from-right-8 duration-300">
              <CardHeader className="text-center space-y-4 pb-2">
                <div className="mx-auto bg-red-50 w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-2"><HardHat className="w-7 h-7" style={{ color: primaryColor }} /></div>
                <div className="space-y-1"><CardTitle className="text-2xl font-bold text-slate-900">Bienvenido</CardTitle><CardDescription className="text-slate-500">Ingresa tus credenciales para acceder al sistema</CardDescription></div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" method="POST" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="correo" className={cn("text-slate-700 font-medium", errors.correo && "text-red-500")}>Correo Corporativo</Label>
                    <div className="relative">
                      <Input id="correo" type="email" placeholder="usuario@byg.cl" className={cn("bg-white border-slate-200 focus-visible:ring-[#D32F2F] pl-3", errors.correo && "border-red-500 focus-visible:ring-red-500 bg-red-50")} {...register("correo")} />
                      {errors.correo && <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />}
                    </div>
                    {errors.correo && <p className="text-xs text-red-500 font-bold mt-1 animate-pulse">{errors.correo.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className={cn("text-slate-700 font-medium", errors.password && "text-red-500")}>Contraseña</Label>
                      <button type="button" onClick={() => setView("RECOVER_EMAIL")} className="text-xs text-[#D32F2F] hover:underline font-semibold">¿Olvidaste tu contraseña?</button>
                    </div>
                    <div className="relative">
                      <Input id="password" type="password" className={cn("bg-white border-slate-200 focus-visible:ring-[#D32F2F]", errors.password && "border-red-500 focus-visible:ring-red-500 bg-red-50")} {...register("password")} />
                      {errors.password && <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />}
                    </div>
                    {errors.password && <p className="text-xs text-red-500 font-bold mt-1 animate-pulse">{errors.password.message}</p>}
                  </div>

                  <Button type="submit" className="w-full text-white font-bold h-11 text-base shadow-lg hover:shadow-xl transition-all mt-2" style={{ backgroundColor: primaryColor }} disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ingresando...</> : "Iniciar Sesión"}
                  </Button>
                </form>
              </CardContent>
            </div>
          )}

          {view === "RECOVER_EMAIL" && (
            <div className="animate-in slide-in-from-right-8 duration-300">
              <CardHeader className="text-center space-y-4 pb-2">
                <div className="mx-auto bg-red-50 w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-2"><Mail className="w-7 h-7" style={{ color: primaryColor }} /></div>
                <div className="space-y-1"><CardTitle className="text-2xl font-bold text-slate-900">Recuperar Cuenta</CardTitle><CardDescription className="text-slate-500">Escribe tu correo. Si existe, te enviaremos un código.</CardDescription></div>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleRequestCode} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="recoveryEmail" className="text-slate-700 font-medium">Correo Electrónico</Label>
                    <Input id="recoveryEmail" type="email" placeholder="ejemplo@byg.cl" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} className="bg-white border-slate-200 focus-visible:ring-[#D32F2F]" required />
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <Button type="submit" className="w-full text-white font-bold h-11" style={{ backgroundColor: primaryColor }} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Código"}</Button>
                    <Button type="button" variant="ghost" className="w-full text-slate-500 hover:text-slate-900" onClick={() => setView("LOGIN")}>Cancelar y Volver</Button>
                  </div>
                </form>
              </CardContent>
            </div>
          )}

          {view === "RECOVER_RESET" && (
            <div className="animate-in slide-in-from-right-8 duration-300">
              <CardHeader className="text-center space-y-4 pb-2">
                <div className="mx-auto bg-red-50 w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-2"><KeyRound className="w-7 h-7" style={{ color: primaryColor }} /></div>
                <div className="space-y-1"><CardTitle className="text-xl font-bold text-slate-900">Nueva Contraseña</CardTitle><CardDescription className="text-slate-500 text-xs">Hemos enviado un código a <strong>{recoveryEmail}</strong></CardDescription></div>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmitReset(handleResetPassword)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="codigo" className={cn("text-slate-700 font-medium", errorsReset.codigo && "text-red-500")}>Código de Verificación</Label>
                    <Input id="codigo" placeholder="123456" className="bg-white border-slate-200 text-center tracking-widest font-mono text-lg focus-visible:ring-[#D32F2F]" {...registerReset("codigo")} />
                    {errorsReset.codigo && <p className="text-xs text-red-500 font-bold">{errorsReset.codigo.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevaPassword" className={cn("text-slate-700 font-medium", errorsReset.nuevaPassword && "text-red-500")}>Nueva Contraseña</Label>
                    <div className="relative">
                        <Input id="nuevaPassword" type="password" placeholder="Mínimo 6 caracteres" className="bg-white border-slate-200 focus-visible:ring-[#D32F2F]" {...registerReset("nuevaPassword")} />
                        <Lock className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                    {errorsReset.nuevaPassword && <p className="text-xs text-red-500 font-bold">{errorsReset.nuevaPassword.message}</p>}
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <Button type="submit" className="w-full text-white font-bold h-11" style={{ backgroundColor: primaryColor }} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cambiar Contraseña"}</Button>
                    <Button type="button" variant="ghost" className="w-full text-slate-500 hover:text-slate-900" onClick={() => setView("RECOVER_EMAIL")}>Atrás</Button>
                  </div>
                </form>
              </CardContent>
            </div>
          )}

          <div className="p-6 pt-0 text-center border-t border-slate-100 mt-2">
            <p className="text-xs text-slate-400 mt-4">Plataforma de uso exclusivo para personal autorizado de ByG Ingeniería.</p>
          </div>
        </Card>
      </div>

      <div className="absolute bottom-6 text-white/30 text-xs">© {new Date().getFullYear()} ByG Ingeniería</div>
    </div>
  );
}