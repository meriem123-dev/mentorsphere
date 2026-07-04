import Image from "next/image";
import logo from "@/public/logo.svg";
import logoIcon from "@/public/icone-logo.svg";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className = "" }: LogoProps) {
   //gérer les 2 cas phone ou PC
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={compact ? logoIcon : logo}
        alt="Mentorsphere"
        width={compact ? 40 : 160}
        height={compact ? 40 : 48}
        priority
        style={{ height: "auto" }}
      />
    </div>
  );
}