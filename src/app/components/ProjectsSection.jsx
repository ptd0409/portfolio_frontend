import { Eye, Github } from "lucide-react";
import { useProjects } from "../context/ProjectsContext";
import { Link } from "react-router-dom";

export function ProjectsSection() {
  const { projects, loading, error } = useProjects();

  return (
    <section id="projects" className="min-h-screen bg-[#f5f3e8] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-[#00003d] mb-4">Projects</h2>
        <div className="w-20 h-1 bg-[#d4c896] mb-12"></div>

        {loading ? (
          <div className="text-gray-600 text-lg">Loading projects...</div>
        ) : error ? (
          <div className="text-red-600 text-lg">{error}</div>
        ) : !projects?.length ? (
          <div className="text-gray-600 text-lg">No projects yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const tags = Array.isArray(project.tags) ? project.tags : [];
              const hasValidCover =
                typeof project.cover_image_url === "string" &&
                project.cover_image_url.trim() !== "" &&
                (project.cover_image_url.startsWith("http://") ||
                  project.cover_image_url.startsWith("https://") ||
                  project.cover_image_url.startsWith("/uploads/"));

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-lg hover:shadow-xl transition-shadow border border-gray-200 flex flex-col overflow-hidden"
                >
                  {hasValidCover && (
                    <div className="w-full h-48 bg-[#f5f3e8] border-b border-gray-200 overflow-hidden">
                      <img
                        src={project.cover_image_url}
                        alt={project.title || project.slug}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl font-semibold text-[#00003d] mb-3">
                      {project.title || project.slug}
                    </h3>

                    <p className="text-gray-700 mb-4 leading-relaxed flex-grow">
                      {project.description || "No description available."}
                    </p>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag) => (
                          <span
                            key={tag.slug || tag.id || tag.name}
                            className="px-3 py-1 text-sm bg-[#f5f3e8] text-[#00003d] rounded-md"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Link
                        to={`/project/${project.slug}`}
                        className="flex-1 px-4 py-2 bg-[#d4c896] text-[#00003d] rounded hover:bg-[#c4b886] transition-colors inline-flex items-center justify-center gap-2 border border-[#00003d]"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>

                      {project.repo_url && (
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#00003d] hover:bg-[#f5f3e8] rounded transition-colors border border-transparent hover:border-gray-200"
                          title="Github"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
