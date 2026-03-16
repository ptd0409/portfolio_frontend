import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Github, Calendar } from "lucide-react";
import { useProjects } from "../context/ProjectsContext";
import { Footer } from "../components/Footer";
import { env } from "../../config/env";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ProjectDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getProjectBySlug } = useProjects();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    let ignore = false;

    async function fetchProjectDetail() {
      setLoading(true);
      setError("");

      try {
        const listItem = getProjectBySlug(slug);

        if (!ignore && listItem) {
          setProject(listItem);
        }

        const res = await fetch(`${env.apiBase}/projects/${slug}`);
        let json = null;

        try {
          json = await res.json();
        } catch (_) {}

        if (!res.ok) {
          throw new Error(json?.detail || "Project not found");
        }

        if (!ignore) {
          setProject(json?.data || null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load project");
          setProject(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchProjectDetail();

    return () => {
      ignore = true;
    };
  }, [slug, getProjectBySlug]);

  if (loading && !project) {
    return (
      <>
        <div className="min-h-screen bg-[#f5f3e8] pt-24 pb-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center py-20 text-gray-600 text-lg">
              Loading project...
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <div className="min-h-screen bg-[#f5f3e8] flex items-center justify-center pt-24 pb-20">
          <div className="text-center px-6">
            <h1 className="text-4xl font-bold text-[#00003d] mb-4">
              Project Not Found
            </h1>

            {error && <p className="text-gray-600 mb-6">{error}</p>}

            <Link
              to="/"
              className="text-[#00003d] hover:opacity-70 transition-opacity inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const projectTags = Array.isArray(project.tags) ? project.tags : [];

  return (
    <>
      <div className="min-h-screen bg-[#f5f3e8] pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-[#00003d] hover:opacity-70 transition-opacity inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="mb-10">
            {project.cover_image_url && (
              <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <img
                  src={project.cover_image_url}
                  alt={project.title || project.slug}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-[#00003d] mb-4 leading-tight">
              {project.title || project.slug}
            </h1>

            {project.description && (
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {project.description}
              </p>
            )}

            {projectTags.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {projectTags.map((tag) => (
                  <span
                    key={tag.id ?? tag.slug ?? tag.name}
                    className="px-4 py-2 bg-white text-[#00003d] rounded-lg border border-[#d4c896]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-center">
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#00003d] text-white rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  View Repository
                </a>
              )}

              {project.published_at && (
                <div className="px-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-700 inline-flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00003d]" />
                  {formatDate(project.published_at)}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#00003d] mb-6">
              Project Content
            </h2>

            {project.content ? (
              <div
                className="prose max-w-none prose-headings:text-[#00003d] prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-[#00003d] prose-a:text-[#00003d] prose-img:rounded-xl prose-img:max-w-full"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            ) : (
              <p className="text-gray-600">No detailed content available.</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
