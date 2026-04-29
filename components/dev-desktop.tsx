"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { PortfolioProject, WorkExperience } from "@/lib/strapi";

type DevDesktopProps = {
  projects: PortfolioProject[];
  experiences: WorkExperience[];
};

type WindowId = "terminal" | "photo" | "vscode" | "cloud";

type DesktopWindowState = {
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
};

type DesktopWindows = Record<WindowId, DesktopWindowState>;

type TransformMode = "move" | "resize";

const MIN_WINDOW_SIZE: Record<WindowId, { width: number; height: number }> = {
  terminal: { width: 560, height: 330 },
  photo: { width: 320, height: 360 },
  vscode: { width: 760, height: 420 },
  cloud: { width: 760, height: 420 }
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function badgeLabel(status: PortfolioProject["status"]) {
  return status === "public" ? "PUBLISHED" : "INTERNAL";
}

function markdownAbout() {
  return `# About Me

![Foto Dawwi](images/PhotoShoot.png)

I am Dawwi, an Informatics student focused on:
- Cloud infrastructure
- DevOps automation
- Linux system administration
- Artificial Intelligence (AI)
- Machine Learning (ML)

Detail-oriented technology professional with hands-on experience in infrastructure operations, cloud technologies, automation, and AI/ML solutions. Skilled in Linux systems, networking, troubleshooting, and deploying scalable services, while also exploring intelligent systems through machine learning and data-driven projects. Passionate about building reliable, efficient, and innovative technology solutions across infrastructure and modern computing environments.`;
}

function buildInitialWindows(canvasWidth: number, canvasHeight: number): DesktopWindows {
  const terminalWidth = clamp(Math.round(canvasWidth * 0.5), 620, 920);
  const terminalHeight = clamp(Math.round(canvasHeight * 0.5), 360, 560);

  const photoWidth = clamp(Math.round(canvasWidth * 0.26), 320, 460);
  const photoHeight = clamp(Math.round(canvasHeight * 0.58), 360, 680);

  const vscodeWidth = clamp(Math.round(canvasWidth * 0.64), 820, 1220);
  const vscodeHeight = clamp(Math.round(canvasHeight * 0.62), 420, 760);

  const cloudWidth = clamp(Math.round(canvasWidth * 0.56), 760, 1060);
  const cloudHeight = clamp(Math.round(canvasHeight * 0.62), 420, 760);

  const terminalX = clamp(26, 0, Math.max(0, canvasWidth - terminalWidth));
  const terminalY = clamp(20, 0, Math.max(0, canvasHeight - terminalHeight));
  const photoX = clamp(canvasWidth - photoWidth - 34, 0, Math.max(0, canvasWidth - photoWidth));
  const photoY = clamp(34, 0, Math.max(0, canvasHeight - photoHeight));
  const vscodeX = clamp(38, 0, Math.max(0, canvasWidth - vscodeWidth));
  const vscodeY = clamp(
    Math.round(canvasHeight * 0.42),
    0,
    Math.max(0, canvasHeight - vscodeHeight)
  );
  const cloudX = clamp(
    Math.round(canvasWidth * 0.36),
    0,
    Math.max(0, canvasWidth - cloudWidth)
  );
  const cloudY = clamp(
    Math.round(canvasHeight * 0.28),
    0,
    Math.max(0, canvasHeight - cloudHeight)
  );

  return {
    terminal: {
      x: terminalX,
      y: terminalY,
      width: terminalWidth,
      height: terminalHeight,
      z: 8
    },
    photo: {
      x: photoX,
      y: photoY,
      width: photoWidth,
      height: photoHeight,
      z: 9
    },
    vscode: {
      x: vscodeX,
      y: vscodeY,
      width: vscodeWidth,
      height: vscodeHeight,
      z: 5
    },
    cloud: {
      x: cloudX,
      y: cloudY,
      width: cloudWidth,
      height: cloudHeight,
      z: 10
    }
  };
}

function fitWindowsToCanvas(prev: DesktopWindows, canvasWidth: number, canvasHeight: number): DesktopWindows {
  const next = { ...prev };

  (Object.keys(next) as WindowId[]).forEach((id) => {
    const min = MIN_WINDOW_SIZE[id];
    const width = clamp(next[id].width, min.width, Math.max(min.width, canvasWidth - 8));
    const height = clamp(next[id].height, min.height, Math.max(min.height, canvasHeight - 8));
    const x = clamp(next[id].x, 0, Math.max(0, canvasWidth - width));
    const y = clamp(next[id].y, 0, Math.max(0, canvasHeight - height));
    next[id] = { ...next[id], width, height, x, y };
  });

  return next;
}

type DraggableWindowProps = {
  id: WindowId;
  title: string;
  subtitle?: string;
  isActive: boolean;
  style: CSSProperties;
  onFocus: (id: WindowId) => void;
  onMoveStart: (id: WindowId, event: ReactPointerEvent<HTMLElement>) => void;
  onResizeStart: (id: WindowId, event: ReactPointerEvent<HTMLElement>) => void;
  children: ReactNode;
};

function DraggableWindow({
  id,
  title,
  subtitle,
  isActive,
  style,
  onFocus,
  onMoveStart,
  onResizeStart,
  children
}: DraggableWindowProps) {
  return (
    <section
      className={isActive ? "desk-window is-active" : "desk-window"}
      style={style}
      onPointerDown={() => onFocus(id)}
    >
      <header className="desk-window-titlebar" onPointerDown={(event) => onMoveStart(id, event)}>
        <div className="desk-window-title">
          <strong>{title}</strong>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        <div className="desk-window-controls" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </header>
      <div className="desk-window-body">{children}</div>
      <button
        type="button"
        className="desk-window-resize"
        aria-label={`Resize ${title}`}
        onPointerDown={(event) => onResizeStart(id, event)}
      />
    </section>
  );
}

export function DevDesktop({ projects, experiences }: DevDesktopProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const zCounterRef = useRef(20);

  const [activeWindow, setActiveWindow] = useState<WindowId>("cloud");
  const [activeCloudTab, setActiveCloudTab] = useState<"projects" | "experience">("projects");
  const [windows, setWindows] = useState<DesktopWindows>(() => buildInitialWindows(1360, 760));

  const aboutMd = markdownAbout();
  const renderedMd = aboutMd
    .split("\n")
    .filter(
      (line) =>
        line.trim() &&
        !line.startsWith("```") &&
        !/^!\[[^\]]*\]\([^)]+\)$/.test(line.trim())
    )
    .map((line) => line.replace(/^#\s/, "").replace(/^- /, "- "));
  const aboutPreviewImage = "/DSC03844_1_1.JPG";

  useEffect(() => {
    const syncCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      if (!initializedRef.current) {
        const initial = buildInitialWindows(rect.width, rect.height);
        setWindows(initial);
        zCounterRef.current = 20;
        initializedRef.current = true;
      } else {
        setWindows((prev) => fitWindowsToCanvas(prev, rect.width, rect.height));
      }
    };

    syncCanvas();
    window.addEventListener("resize", syncCanvas);
    return () => window.removeEventListener("resize", syncCanvas);
  }, []);

  const focusWindow = (id: WindowId) => {
    setActiveWindow(id);
    setWindows((prev) => {
      const nextZ = zCounterRef.current + 1;
      zCounterRef.current = nextZ;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          z: nextZ
        }
      };
    });
  };

  const startTransform = (id: WindowId, mode: TransformMode, event: ReactPointerEvent<HTMLElement>) => {
    if (mode === "move") {
      const target = event.target as HTMLElement;
      if (target.closest("button, a, input, textarea")) return;
    }

    event.preventDefault();
    focusWindow(id);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const base = windows[id];
    const min = MIN_WINDOW_SIZE[id];

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      setWindows((prev) => {
        const current = prev[id];

        if (mode === "move") {
          const nextX = clamp(base.x + dx, 0, Math.max(0, canvasRect.width - current.width));
          const nextY = clamp(base.y + dy, 0, Math.max(0, canvasRect.height - current.height));
          return { ...prev, [id]: { ...current, x: nextX, y: nextY } };
        }

        const nextWidth = clamp(
          base.width + dx,
          min.width,
          Math.max(min.width, canvasRect.width - base.x)
        );
        const nextHeight = clamp(
          base.height + dy,
          min.height,
          Math.max(min.height, canvasRect.height - base.y)
        );

        return { ...prev, [id]: { ...current, width: nextWidth, height: nextHeight } };
      });
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const windowStyle = (id: WindowId): CSSProperties => ({
    left: `${windows[id].x}px`,
    top: `${windows[id].y}px`,
    width: `${windows[id].width}px`,
    height: `${windows[id].height}px`,
    zIndex: windows[id].z
  });

  return (
    <main className="desktop-shell">
      <div className="desktop-ambient ambient-a" />
      <div className="desktop-ambient ambient-b" />

      <section className="desktop-runtime desktop-only container">
        <header className="desktop-topbar">
          <div className="desktop-brand">
            <span className="dot red" />
            <span className="dot amber" />
            <span className="dot green" />
            <span>Interactive Desktop Portfolio</span>
          </div>
          <ThemeToggle />
        </header>

        <div ref={canvasRef} className="desktop-canvas" aria-label="Desktop canvas">
          <DraggableWindow
            id="terminal"
            title="terminal.sh"
            subtitle="fedora@cloud-shell"
            isActive={activeWindow === "terminal"}
            style={windowStyle("terminal")}
            onFocus={focusWindow}
            onMoveStart={(id, event) => startTransform(id, "move", event)}
            onResizeStart={(id, event) => startTransform(id, "resize", event)}
          >
            <section className="terminal-pane">
              <div className="window-tabs">
                <span className="active">Fedora Server</span>
                <span>OCI VPS</span>
                <span>New Tab</span>
              </div>
              <p className="terminal-meta">Web console: https://localhost:9090</p>
              <p className="terminal-meta">Last login: Sat Mar 29 20:19:37 2026</p>
              <p className="terminal-line">
                <span className="prompt">dawwi@fedora</span>:<span className="path">~</span>$ cat profile.md
              </p>
              <h1 className="typed-title">
                <span>Hi, I&apos;m Dawwi</span>
              </h1>
              <div className="nano-tags-block">
                <p>| Linux | Cloud Computing | Infrastructure |</p>
                <p>| DevOps | SRE | System administrator |</p>
              </div>
              <div className="terminal-tree">
                <p className="terminal-line">
                  <span className="prompt">dawwi@fedora</span>:<span className="path">~</span>$ tree
                </p>
                <ul>
                  <li>+-- terminal-window</li>
                  <li>+-- about-vscode</li>
                  <li>+-- project-console</li>
                </ul>
                <p className="terminal-line">
                  <span className="prompt">dawwi@fedora</span>:<span className="path">~</span>$ pwd
                </p>
                <p className="pwd-output">/home/dawwi/workspace/portfolio</p>
              </div>
            </section>
          </DraggableWindow>

          <DraggableWindow
            id="photo"
            title="image-viewer"
            subtitle="profile.png"
            isActive={activeWindow === "photo"}
            style={windowStyle("photo")}
            onFocus={focusWindow}
            onMoveStart={(id, event) => startTransform(id, "move", event)}
            onResizeStart={(id, event) => startTransform(id, "resize", event)}
          >
            <section className="photo-pane">
              <div className="photo-menubar">File Edit Sizes Window Properties</div>
              <div className="photo-frame">
                <Image
                  src="/profile.png"
                  alt="Foto jas Dawwi"
                  width={320}
                  height={410}
                  className="photo-image"
                  suppressHydrationWarning
                />
              </div>
            </section>
          </DraggableWindow>

          <DraggableWindow
            id="vscode"
            title="Visual Studio Code"
            subtitle="about.md"
            isActive={activeWindow === "vscode"}
            style={windowStyle("vscode")}
            onFocus={focusWindow}
            onMoveStart={(id, event) => startTransform(id, "move", event)}
            onResizeStart={(id, event) => startTransform(id, "resize", event)}
          >
            <section className="vscode-pane">
              <header className="vscode-menubar">
                <div className="vscode-menubar-left">
                  <Image
                    src="/Visual_Studio_Code_1.35_icon.svg.png"
                    alt="VS Code logo"
                    width={15}
                    height={15}
                    className="vscode-logo"
                  />
                  <nav>
                    <span>File</span>
                    <span>Edit</span>
                    <span>Selection</span>
                    <span>View</span>
                    <span>Go</span>
                    <span>Run</span>
                    <span>Terminal</span>
                    <span>Help</span>
                  </nav>
                </div>
              </header>

              <div className="vscode-workbench">
                <aside className="activity-bar" aria-label="VS Code activity bar">
                  <button type="button" className="active" aria-label="Explorer">
                    <span className="activity-glyph">E</span>
                  </button>
                  <button type="button" aria-label="Search">
                    <span className="activity-glyph">S</span>
                  </button>
                  <button type="button" aria-label="Source Control">
                    <span className="activity-glyph">G</span>
                  </button>
                </aside>

                <aside className="explorer-panel">
                  <p className="explorer-title">EXPLORER</p>
                  <ul>
                    <li className="folder">MY_PORTFOLIO</li>
                    <li className="indent folder">app</li>
                    <li className="indent file">page.tsx</li>
                    <li className="indent file">globals.css</li>
                    <li className="indent folder">components</li>
                    <li className="indent file">dev-desktop.tsx</li>
                    <li className="indent folder">public</li>
                    <li className="indent file">profile.png</li>
                    <li className="indent file">DSC03844_1_1.JPG</li>
                  </ul>
                </aside>

                <section className="editor-area">
                  <div className="editor-tabbar">
                    <span className="active">about.md</span>
                    <span>preview.md</span>
                  </div>

                  <div className="editor-split">
                    <article className="md-source">
                      <h3>Markdown Source</h3>
                      <pre>{aboutMd}</pre>
                    </article>

                    <article className="md-preview">
                      <h3>Rendered Preview</h3>
                      <div className="carousel single-image">
                        <Image
                          src={aboutPreviewImage}
                          alt="Foto jaket abu Dawwi"
                          width={210}
                          height={260}
                          className="carousel-image"
                          suppressHydrationWarning
                        />
                        <p>Foto profile jaket abu</p>
                      </div>
                      <div className="rendered-text">
                        {renderedMd.map((line, index) => (
                          <p key={`${line}-${index}`}>{line}</p>
                        ))}
                      </div>
                    </article>
                  </div>
                </section>
              </div>
            </section>
          </DraggableWindow>

          <DraggableWindow
            id="cloud"
            title="Notepad Workspace"
            subtitle="project.notes + experience.notes"
            isActive={activeWindow === "cloud"}
            style={windowStyle("cloud")}
            onFocus={focusWindow}
            onMoveStart={(id, event) => startTransform(id, "move", event)}
            onResizeStart={(id, event) => startTransform(id, "resize", event)}
          >
            <section className="notepad-pane">
              <header className="notepad-topbar">
                <div className="notepad-appname">
                  <Image
                    src="/notepad--1.svg"
                    alt="Notepad++ icon"
                    width={15}
                    height={15}
                    className="notepad-appicon"
                  />
                  <span>*new 1 - Notepad++</span>
                </div>
                <div className="notepad-window-controls" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
              </header>

              <div className="notepad-tabs">
                <button
                  type="button"
                  className={activeCloudTab === "projects" ? "active" : ""}
                  onClick={() => setActiveCloudTab("projects")}
                >
                  <Image
                    src="/Windows_Notepad_icon.png"
                    alt="Windows Notepad icon"
                    width={14}
                    height={14}
                    className="note-tab-icon"
                  />
                  <span>project.notes</span>
                </button>
                <button
                  type="button"
                  className={activeCloudTab === "experience" ? "active" : ""}
                  onClick={() => setActiveCloudTab("experience")}
                >
                  <Image
                    src="/notepad--1.svg"
                    alt="Notepad++ icon"
                    width={14}
                    height={14}
                    className="note-tab-icon"
                  />
                  <span>experience.notes</span>
                </button>
                <button type="button" className="note-tab-add" aria-label="New tab">
                  +
                </button>
              </div>

              <div className="notepad-menubar">
                <span>File</span>
                <span>Edit</span>
                <span>Search</span>
                <span>View</span>
                <span>Encoding</span>
                <span>Language</span>
                <span>Settings</span>
                <span>Tools</span>
              </div>

              <div className="notepad-editor">
                {activeCloudTab === "projects" ? (
                  <section className="notes-section">
                    <header className="notes-header">
                      <h3>Project Workspace</h3>
                      <p>List project publish dan internal dalam format catatan dev.</p>
                    </header>

                    <div className="notes-list">
                      {projects.map((project, index) => (
                        <article className="notes-item" key={project.id}>
                          <p className="notes-line-number">{index + 1}</p>
                          <div className="notes-main">
                            <strong>{project.title}</strong>
                            <p>{project.tags.slice(0, 3).join(" | ") || "No tech tags yet"}</p>
                            <div className="notes-meta">
                              <span className={project.status === "public" ? "state run" : "state idle"}>
                                {badgeLabel(project.status)}
                              </span>
                              <div className="table-actions">
                                {project.liveUrl ? (
                                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                                    Open
                                  </a>
                                ) : null}
                                {project.repoUrl ? (
                                  <a href={project.repoUrl} target="_blank" rel="noreferrer">
                                    Repo
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : (
                  <section className="notes-section">
                    <header className="notes-header">
                      <h3>Experience Notes</h3>
                      <p>Riwayat pengalaman kerja dalam format timeline sederhana.</p>
                    </header>

                    <div className="notes-list">
                      {experiences.map((experience, index) => (
                        <article className="notes-item" key={experience.id}>
                          <p className="notes-line-number">{index + 1}</p>
                          <div className="notes-main">
                            <strong>{experience.role}</strong>
                            <p>{experience.company}</p>
                            <p>{experience.period}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </section>
          </DraggableWindow>
        </div>
      </section>

      <section className="mobile-fallback mobile-only container">
        <header className="desktop-topbar">
          <div className="desktop-brand">
            <span className="dot red" />
            <span className="dot amber" />
            <span className="dot green" />
            <span>Mobile Portfolio Mode</span>
          </div>
          <ThemeToggle />
        </header>

        <div className="mobile-stack">
          <article className="mobile-card">
            <h2>Hi, I&apos;m Dawwi</h2>
            <p>Cloud, DevOps, Linux infrastructure enthusiast.</p>
            <div className="nano-tags-block">
              <p>| Linux | Cloud Computing | Infrastructure |</p>
              <p>| DevOps | SRE | System administrator |</p>
            </div>
          </article>

          <article className="mobile-card">
            <h3>Profile</h3>
            <Image
              src="/profile.png"
              alt="Foto profile Dawwi"
              width={280}
              height={340}
              className="mobile-photo"
              suppressHydrationWarning
            />
          </article>

          <article className="mobile-card">
            <h3>About Me (Markdown Preview)</h3>
            <div className="rendered-text">
              {renderedMd.slice(0, 8).map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
              ))}
            </div>
          </article>

          <article className="mobile-card">
            <h3>Projects</h3>
            <div className="mobile-list">
              {projects.map((project) => (
                <div key={project.id} className="mobile-list-item">
                  <strong>{project.title}</strong>
                  <p>{project.tags.slice(0, 3).join(", ")}</p>
                  <span className={project.status === "public" ? "state run" : "state idle"}>
                    {badgeLabel(project.status)}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="mobile-card">
            <h3>Experience</h3>
            <div className="mobile-list">
              {experiences.map((experience) => (
                <div key={experience.id} className="mobile-list-item">
                  <strong>{experience.role}</strong>
                  <p>{experience.company}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
