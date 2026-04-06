import { DevDesktop } from "@/components/dev-desktop";
import { getPortfolioData, type PortfolioProject, type WorkExperience } from "@/lib/strapi";

const dummyProjects: PortfolioProject[] = [
  {
    id: "dummy-public-1",
    title: "Cloud Cost Monitor",
    description: "Dashboard untuk monitor cost cloud multi-provider dengan alert otomatis.",
    tags: ["Next.js", "Prometheus", "Grafana"],
    repoUrl: "https://github.com/example/cloud-cost-monitor",
    liveUrl: "https://demo.example.com/cloud-cost-monitor",
    status: "public"
  },
  {
    id: "dummy-public-2",
    title: "Server Provision Pipeline",
    description: "Pipeline provisioning server pakai IaC untuk environment staging dan production.",
    tags: ["Terraform", "Ansible", "GitHub Actions"],
    repoUrl: "https://github.com/example/server-provision-pipeline",
    liveUrl: "https://demo.example.com/provisioning",
    status: "public"
  },
  {
    id: "dummy-private-1",
    title: "Internal Log Aggregator",
    description: "Sistem agregasi log internal berbasis OpenSearch dan alerting berbasis SLA.",
    tags: ["OpenSearch", "Fluent Bit", "Kibana"],
    repoUrl: "https://github.com/example/internal-log-aggregator",
    status: "private"
  },
  {
    id: "dummy-private-2",
    title: "Zero Downtime Deploy Tool",
    description: "Tool internal deploy rolling update dengan health check dan rollback otomatis.",
    tags: ["Docker", "Nginx", "Bash"],
    repoUrl: "https://github.com/example/zero-downtime-deploy",
    status: "private"
  }
];

const dummyExperiences: WorkExperience[] = [
  {
    id: "exp-1",
    role: "Cloud Infrastructure Engineer",
    company: "Cihuy Digital Labs",
    period: "2025 - Sekarang",
    location: "Bandung / Remote",
    summary:
      "Maintaining production cluster, automating deployment pipelines, and improving reliability across services."
  },
  {
    id: "exp-2",
    role: "DevOps Engineer",
    company: "Nusantara Tech",
    period: "2024 - 2025",
    location: "Jakarta",
    summary:
      "Built CI/CD standards, implemented observability stack, and reduced deployment failure rate significantly."
  },
  {
    id: "exp-3",
    role: "System Administrator",
    company: "Infra Ops Studio",
    period: "2023 - 2024",
    location: "Bandung",
    summary:
      "Managed Linux servers, hardened Nginx virtual host configs, and optimized uptime for critical systems."
  },
  {
    id: "exp-4",
    role: "Junior Backend Engineer",
    company: "Freelance Projects",
    period: "2022 - 2023",
    location: "Remote",
    summary:
      "Implemented REST APIs, deployed apps using containerized workflows, and collaborated with frontend teams."
  }
];

export default async function HomePage() {
  const { publicProjects, closeProjects, experiences } = await getPortfolioData();

  const mergedProjects = [...publicProjects, ...closeProjects];
  const projects = mergedProjects.length > 0 ? mergedProjects : dummyProjects;
  const workExperiences = experiences.length > 0 ? experiences : dummyExperiences;

  return <DevDesktop projects={projects} experiences={workExperiences} />;
}
