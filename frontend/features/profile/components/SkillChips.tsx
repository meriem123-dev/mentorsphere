export function SkillChips({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-full bg-brand-blue/10 px-3 py-1.5 text-sm font-medium text-brand-blue"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}