import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { WorkTabs } from "@/components/work-tabs";
import { getPortfolioData, type PortfolioProject } from "@/lib/strapi";

function EmptyState({ label }: { label: string }) {
  return (
    <article className="empty-state">
      <h3>{label}</h3>
      <p>
        Data belum ada di Strapi. Isi collection di <code>CMS_Dawwi</code> lalu refresh halaman.
      </p>
    </article>
  );
}

function SectionTitle({
  id,
  title,
  subtitle,
  count
}: {
  id: string;
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <header className="section-title" id={id}>
      <div>
        <p className="section-kicker">$ ls --all</p>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <span>{count} item</span>
    </header>
  );
}

function toHostName(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return slug || "project";
}

function ProjectNanoList({ projects }: { projects: PortfolioProject[] }) {
  return (
    <section className="nano-editor">
      <header className="nano-head">
        <span>GNU nano 7.2</span>
        <strong>/etc/nginx/sites-available/portfolio-projects.conf</strong>
      </header>

      <div className="nano-buffer">
        {projects.map((project, index) => {
          const hostName = toHostName(project.title);
          const isPublic = project.status === "public";

          return (
            <article className="nano-project" key={project.id}>
              <span className="line-number">{index + 1}</span>

              <div className="nano-content">
                <div className="project-head">
                  <h3>{project.title}</h3>
                  <span className={`badge ${isPublic ? "live" : "private"}`}>
                    {isPublic ? "PUBLISHED" : "INTERNAL"}
                  </span>
                </div>

                <p className="nano-line">
                  <span className="kw">server</span> {"{"}
                </p>
                <p className="nano-line indent">
                  <span className="kw">server_name</span> {hostName}.dawwi.dev;
                </p>
                <p className="nano-line indent">
                  <span className="kw">root</span> /var/www/{hostName};
                </p>
                <p className="nano-line indent">
                  <span className="kw">set</span> $project_type{" "}
                  <span className={isPublic ? "inline-status live" : "inline-status private"}>
                    {isPublic ? "published" : "internal"}
                  </span>
                  ;
                </p>
                <p className="nano-line indent">
                  <span className="kw"># description</span> {project.description}
                </p>
                <p className="nano-line">{"}"}</p>

                <div className="tag-list">
                  {project.tags.length > 0 ? (
                    project.tags.map((tag) => <span key={`${project.id}-${tag}`}>{tag}</span>)
                  ) : (
                    <span>Tech stack belum diisi</span>
                  )}
                </div>

                <div className="project-links">
                  {project.liveUrl ? (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer">
                      Open App
                    </a>
                  ) : null}
                  {project.repoUrl ? (
                    <a href={project.repoUrl} target="_blank" rel="noreferrer">
                      Git Repo
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="nano-foot">
        <span>^G Help</span>
        <span>^O Write Out</span>
        <span>^W Where Is</span>
        <span>^K Cut Text</span>
        <span>^X Exit</span>
      </footer>
    </section>
  );
}

export default async function HomePage() {
  const { publicProjects, closeProjects, experiences } = await getPortfolioData();

  const allProjects = [...publicProjects, ...closeProjects].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "public" ? -1 : 1;
  });

  return (
    <main className="page-shell">
      <div className="page-glow glow-a" />
      <div className="page-glow glow-b" />

      <section className="terminal container">
        <header className="terminal-head">
          <div className="window-controls">
            <span className="dot red" />
            <span className="dot amber" />
            <span className="dot green" />
          </div>
          <p className="terminal-title">dawwi@cloud:~/portfolio</p>
          <ThemeToggle />
        </header>

        <section className="terminal-body">
          <nav className="terminal-nav">
            <a href="#projects">Projects</a>
            <a href="#experience">Experience</a>
          </nav>

          <section className="hero">
            <div className="hero-main">
              <p className="hero-kicker">[linux] [cloud] [infra] [devops]</p>
              <p className="command-line">
                <span className="prompt">dawwi@cloud</span>
                <span className="prompt-separator">:</span>
                <span className="path">~</span>
                <span className="prompt-separator">$</span>
                <span>cat profile.txt</span>
              </p>
              <h1 className="typed-heading">
                <span>Hi, I&apos;m Dawwi</span>
              </h1>
              <p className="hero-subtitle">
                I build stable cloud infrastructure, automation pipelines, and production-ready systems.
              </p>
              <p className="hero-copy">
                Portfolio ini narik data dari Strapi CMS untuk menampilkan project public, project
                internal, dan pengalaman kerja dengan nuansa cloud console.
              </p>

              <div className="hero-actions">
                <a href="#projects" className="btn btn-primary">
                  Explore Projects
                </a>
                <a href="#experience" className="btn btn-ghost">
                  Work Experience
                </a>
              </div>

              <div className="hero-tags">
                <span>Linux Server</span>
                <span>Automation</span>
                <span>CI/CD</span>
                <span>CloudOps</span>
              </div>
            </div>

            <aside className="hero-aside">
              <Image
                src="/profile.png"
                alt="Foto profil Dawwi"
                width={220}
                height={220}
                className="hero-avatar"
                priority
                suppressHydrationWarning
              />

              <div className="stats">
                <article className="stat">
                  <p>published</p>
                  <strong>{publicProjects.length}</strong>
                </article>
                <article className="stat">
                  <p>internal</p>
                  <strong>{closeProjects.length}</strong>
                </article>
                <article className="stat">
                  <p>experience</p>
                  <strong>{experiences.length}</strong>
                </article>
              </div>
            </aside>
          </section>

          <section className="content-block">
            <SectionTitle
              id="projects"
              title="Projects"
              subtitle="Semua project dalam satu list, diberi tanda Published atau Internal."
              count={allProjects.length}
            />
            {allProjects.length === 0 ? (
              <EmptyState label="Belum ada project publish/internal." />
            ) : (
              <ProjectNanoList projects={allProjects} />
            )}
          </section>

          <section className="content-block">
            <SectionTitle
              id="experience"
              title="Work Experience"
              subtitle="Riwayat role terkait system, cloud, dan infrastruktur."
              count={experiences.length}
            />
            {experiences.length === 0 ? (
              <EmptyState label="Belum ada pengalaman kerja." />
            ) : (
              <WorkTabs experiences={experiences} />
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
