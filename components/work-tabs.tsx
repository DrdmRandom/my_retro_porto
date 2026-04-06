"use client";

import { useMemo, useState } from "react";
import type { WorkExperience } from "@/lib/strapi";

export function WorkTabs({ experiences }: { experiences: WorkExperience[] }) {
  const [activeTab, setActiveTab] = useState(0);

  const current = useMemo(() => {
    if (experiences.length === 0) return null;
    return experiences[Math.min(activeTab, experiences.length - 1)];
  }, [activeTab, experiences]);

  if (!current) return null;

  return (
    <section className="browser-tabs">
      <div className="tab-strip" role="tablist" aria-label="Work experience tabs">
        {experiences.map((experience, index) => (
          <button
            key={experience.id}
            type="button"
            role="tab"
            aria-selected={activeTab === index}
            className={activeTab === index ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab(index)}
          >
            <span className="tab-icon" />
            <span className="tab-label">{experience.company}</span>
          </button>
        ))}
      </div>

      <article className="tab-panel" role="tabpanel">
        <h3>{current.role}</h3>
        <p className="tab-meta">
          {current.company} | {current.period} | {current.location}
        </p>
        <p>{current.summary}</p>
      </article>
    </section>
  );
}
