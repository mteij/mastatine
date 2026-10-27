interface PageHeaderProps {
  title: string;
  intro?: string;
  className?: string;
}

export default function PageHeader({ title, intro, className = "" }: PageHeaderProps) {
  return (
    <div className={`container-prose pb-10 pt-14 sm:pt-16 ${className}`}>
      <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
      <span className="mt-5 block h-1 w-14 rounded-full bg-accent" aria-hidden />
      {intro && <p className="mt-6 text-lg text-muted">{intro}</p>}
    </div>
  );
}
