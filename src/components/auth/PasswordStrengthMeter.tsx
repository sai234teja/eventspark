import { useMemo } from "react";
import { Check, X } from "lucide-react";

export function PasswordStrengthMeter({ password }: { password: string }) {
  const criteria = useMemo(() => [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const strengthScore = criteria.filter((c) => c.met).length;
  
  let strengthLabel = "Weak";
  let strengthColor = "bg-rose-500";
  
  if (strengthScore >= 3 && strengthScore < 5) {
    strengthLabel = "Medium";
    strengthColor = "bg-yellow-500";
  } else if (strengthScore === 5) {
    strengthLabel = "Strong";
    strengthColor = "bg-emerald-500";
  }

  if (password.length === 0) {
    strengthLabel = "None";
    strengthColor = "bg-slate-700";
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">Password Strength</span>
        <span className={strengthColor.replace('bg-', 'text-')}>{strengthLabel}</span>
      </div>
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`flex-1 rounded-full ${
              password.length > 0 && level <= strengthScore ? strengthColor : "bg-slate-800"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-1 mt-2">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {c.met ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <X className="h-3 w-3 text-slate-600" />
            )}
            <span className={c.met ? "text-emerald-500/80" : "text-slate-500"}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
