export default function SectionHeading({ eyebrow, title, description, align = 'center', action }) {
  const alignment = align === 'left' ? 'text-left items-start' : 'text-center items-center mx-auto';
  return (
    <div className={`flex flex-col gap-3 ${alignment} ${align === 'center' ? 'max-w-2xl' : ''}`}>
      {eyebrow && (
        <span className="eyebrow">
          <span className="h-px w-6 bg-gold-500" />
          {eyebrow}
        </span>
      )}
      <div className={`flex w-full flex-col gap-3 ${align === 'left' ? 'sm:flex-row sm:items-end sm:justify-between' : ''}`}>
        <h2 className="text-3xl font-semibold leading-tight text-ink md:text-4xl">{title}</h2>
        {action}
      </div>
      {description && <p className="text-[15px] leading-relaxed text-ink-500">{description}</p>}
    </div>
  );
}
