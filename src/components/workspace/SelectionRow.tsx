import { HexIcon } from "./HexIcon";
import { MapPin, Globe, Instagram, AppWindow, Send, Linkedin, Bot, Mail, Calendar, Database } from "lucide-react";

export type SectionKey = `s${1|2|3|4|5|6}`;
export type Selection = Record<SectionKey, string | null>;

export const SECTION_OPTIONS: Record<SectionKey, { key: string; label: string; Icon: any }[]> = {
  s1: [
    { key: "google_maps", label: "Google Maps", Icon: MapPin },
    { key: "apollo", label: "Apollo", Icon: Globe },
    { key: "apify", label: "Apify", Icon: AppWindow },
    { key: "instagram", label: "Instagram", Icon: Instagram },
  ],
  s2: [
    { key: "instantly", label: "Instantly", Icon: Send },
    { key: "lemlist", label: "Lemlist", Icon: Bot },
  ],
  s3: [
    { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
    { key: "perplexity", label: "Perplexity AI", Icon: Bot },
  ],
  s4: [
    { key: "gmail", label: "Gmail", Icon: Mail },
  ],
  s5: [
    { key: "cal", label: "Cal.com", Icon: Calendar },
  ],
  s6: [
    { key: "crm", label: "CRM", Icon: Database },
  ],
};

export function SelectionRow({ value, onChange }: { value: Selection; onChange: (key: SectionKey, sel: string) => void }) {
  return (
    <div className="mt-4 space-y-3" role="list" aria-label="Selection rows">
      {(Object.keys(SECTION_OPTIONS) as SectionKey[]).map((sk) => (
        <div key={sk} className="flex items-center gap-3" role="listitem">
          <div className="w-16 text-xs text-gray-500 dark:text-gray-400">{sk.toUpperCase()}</div>
          <div className="flex gap-2">
            {SECTION_OPTIONS[sk].map(({ key, label, Icon }) => (
              <HexIcon
                key={key}
                title={label}
                Icon={Icon}
                selected={value[sk] === key}
                onClick={() => onChange(sk, key)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
