"use client";

import { MapPin, Languages as LanguagesIcon } from "lucide-react";
import NextLink from "next/link";
import { Link as LinkIcon } from "lucide-react";

interface ProfileInfoCardProps {
  city?: string | null;
  country?: string | null;
  languages: { language: { name: string } }[];
  socialLinks: { platform: string; url: string }[];
}

export function ProfileInfoCard({
  city,
  country,
  languages,
  socialLinks,
}: ProfileInfoCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground">Informations</h3>

      <div className="mt-4 space-y-3 text-sm">
        {(city || country) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{[city, country].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {languages.length > 0 && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <LanguagesIcon className="h-4 w-4 shrink-0 translate-y-0.5" />
            <span>{languages.map((l) => l.language.name).join(", ")}</span>
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {socialLinks.map((link) => (
              <NextLink
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <LinkIcon className="h-3 w-3" />
                {link.platform}
              </NextLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}