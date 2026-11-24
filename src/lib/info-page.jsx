import { LinkPills, PageHead, Section } from "@/components/ui";

export function InfoPage({ crumb, title, intro, sections, children, links }) {
  return (
    <>
      <PageHead crumbs={[{ label: crumb }]} title={title} intro={intro} />
      {children && <Section>{children}</Section>}
      <Section className="bg-white">
        <div className="prose-site max-w-3xl [&>section:first-child>h2]:mt-0">
          {sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </section>
          ))}
        </div>
      </Section>
      {links && (
        <Section>
          <LinkPills title="Useful links" links={links} />
        </Section>
      )}
    </>
  );
}
