import { User } from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="text-primary" size={24} />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Profil Personnel</h1>
      <p className="text-muted-foreground text-sm mt-2">Étape 1 sur 3 — Profil Personnel</p>
    </div>
  );
}