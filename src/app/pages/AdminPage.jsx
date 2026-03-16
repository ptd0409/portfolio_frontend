import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, Save, RotateCcw, LogOut } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { useProjects } from "../context/ProjectsContext";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { AdminAuthPanel } from "../components/AdminAuthPanel";

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  content: "",
  cover_image_url: "",
  repo_url: "",
  published_at: "",
  tagsInput: "",
};

import { env } from "../../config/env";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toLocalDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function tagsToInput(tags) {
  if (!Array.isArray(tags)) return "";
  return tags
    .map((tag) => (typeof tag === "string" ? tag : tag?.name))
    .filter(Boolean)
    .join(", ");
}

export function AdminPage() {
  const editorRef = useRef(null);
  const slugRef = useRef("");
  const tokenRef = useRef("");

  const {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const { token, isAuthenticated, logout } = useAuth();

  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects({ page: 1, limit: 100 });
    }
  }, [isAuthenticated]);

  const normalizedProjects = useMemo(() => {
    return Array.isArray(projects) ? projects : [];
  }, [projects]);

  const resetForm = () => {
    setEditingProject(null);
    setFormData(EMPTY_FORM);
    setStatusMessage("");
    slugRef.current = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (project) => {
    setStatusMessage("");
    setEditingProject(project);

    const nextSlug = project.slug || "";

    setFormData({
      title: project.title || "",
      slug: nextSlug,
      description: project.description || "",
      content: project.content || "",
      cover_image_url: project.cover_image_url || "",
      repo_url: project.repo_url || "",
      published_at: toLocalDateTimeInput(project.published_at),
      tagsInput: tagsToInput(project.tags),
    });

    slugRef.current = nextSlug;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title" && !editingProject) {
      const nextSlug = slugify(value);

      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: nextSlug,
      }));

      slugRef.current = nextSlug;
      return;
    }

    if (name === "slug") {
      slugRef.current = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildPayload = () => {
    const tags = formData.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const base = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      content: formData.content,
      cover_image_url: formData.cover_image_url.trim() || null,
      repo_url: formData.repo_url.trim() || null,
      published_at: formData.published_at
        ? new Date(formData.published_at).toISOString()
        : null,
      tags,
    };

    if (!editingProject) {
      return {
        ...base,
        slug: formData.slug.trim(),
      };
    }

    return base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");

    if (!tokenRef.current?.trim()) {
      setStatusMessage("You must be logged in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();

      if (editingProject) {
        await updateProject(editingProject.slug, payload);
        setStatusMessage("Project updated successfully.");
      } else {
        await addProject(payload);
        setStatusMessage("Project created successfully.");
      }

      await fetchProjects({ page: 1, limit: 100 });
      resetForm();
    } catch (err) {
      setStatusMessage(err.message || "Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (project) => {
    if (!tokenRef.current?.trim()) {
      setStatusMessage("You must be logged in.");
      return;
    }

    if (
      !window.confirm(`Are you sure you want to delete "${project.title}"?`)
    ) {
      return;
    }

    try {
      await deleteProject(project.slug);
      setStatusMessage("Project deleted successfully.");
      await fetchProjects({ page: 1, limit: 100 });

      if (editingProject?.slug === project.slug) {
        resetForm();
      }
    } catch (err) {
      setStatusMessage(err.message || "Failed to delete project.");
    }
  };

  const handleCoverUpload = async (file) => {
    const currentToken = tokenRef.current?.trim();
    const currentSlug = slugRef.current?.trim() || formData.slug?.trim();

    if (!currentToken) {
      setStatusMessage("You must be logged in before uploading cover image.");
      return;
    }

    if (!currentSlug) {
      setStatusMessage(
        "Please enter project slug before uploading cover image."
      );
      return;
    }

    setIsUploadingCover(true);
    setStatusMessage("");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("project_slug", currentSlug);

      const res = await fetch(`${env.apiBase}/admin/uploads/cover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        body: data,
      });

      let json = null;
      try {
        json = await res.json();
      } catch (_) {}

      if (!res.ok) {
        throw new Error(json?.detail || json?.message || "Cover upload failed");
      }

      const location = json?.location;
      if (!location) {
        throw new Error("Upload succeeded but no cover image URL returned.");
      }

      setFormData((prev) => ({
        ...prev,
        cover_image_url: location,
      }));

      setStatusMessage("Cover image uploaded successfully.");
    } catch (err) {
      setStatusMessage(err.message || "Failed to upload cover image.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-[#f5f3e8] pt-24 pb-20">
          <div className="max-w-4xl mx-auto px-6">
            <AdminAuthPanel />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f3e8] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-6 mb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-bold text-[#00003d] mb-4">
                Admin Dashboard
              </h1>
              <div className="w-20 h-1 bg-[#d4c896]"></div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Link
                to="/"
                className="px-6 py-3 bg-white text-[#00003d] rounded-lg hover:bg-gray-50 transition-colors border-2 border-[#00003d] text-center"
              >
                Back to Site
              </Link>

              <button
                onClick={resetForm}
                className="px-6 py-3 bg-[#d4c896] text-[#00003d] rounded-lg hover:bg-[#c4b886] transition-colors border-2 border-[#00003d] inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Project
              </button>

              <button
                onClick={logout}
                className="px-6 py-3 bg-white text-[#00003d] rounded-lg hover:bg-gray-50 transition-colors border-2 border-[#00003d] inline-flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className="mb-6 px-4 py-3 bg-white border border-[#00003d] rounded-lg text-[#00003d]">
              {statusMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-[#00003d]">
                  {editingProject ? "Edit project" : "Create new project"}
                </h2>
                <p className="text-gray-600 mt-2">
                  Write and manage your portfolio content directly here.
                </p>
              </div>

              {editingProject && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#00003d] font-semibold mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c896]"
                    placeholder="Project title"
                  />
                </div>

                <div>
                  <label className="block text-[#00003d] font-semibold mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    required={!editingProject}
                    value={formData.slug}
                    onChange={handleChange}
                    readOnly={!!editingProject}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c896] ${
                      editingProject
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="project-slug"
                  />
                  {editingProject && (
                    <p className="text-sm text-gray-500 mt-2">
                      Slug cannot be changed after creation.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#00003d] font-semibold mb-2">
                  Short description *
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c896] resize-none"
                  placeholder="Brief description for project card"
                />
              </div>

              <div>
                <label className="block text-[#00003d] font-semibold mb-2">
                  Content *
                </label>

                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    onInit={(_, editor) => {
                      editorRef.current = editor;
                    }}
                    value={formData.content}
                    onEditorChange={(value) =>
                      setFormData((prev) => ({ ...prev, content: value }))
                    }
                    init={{
                      height: 520,
                      menubar: false,
                      branding: false,
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                        "help",
                        "wordcount",
                      ],
                      toolbar:
                        "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist blockquote | link image media | code preview fullscreen",
                      content_style: `
                        body {
                          font-family: Inter, Arial, sans-serif;
                          font-size: 16px;
                          line-height: 1.7;
                          padding: 12px;
                        }
                        img {
                          max-width: 100%;
                          height: auto;
                          border-radius: 12px;
                        }
                      `,
                      images_upload_handler: async (blobInfo) => {
                        const currentToken = tokenRef.current?.trim();
                        const currentSlug = slugRef.current?.trim();

                        if (!currentToken) {
                          throw new Error(
                            "You must be logged in before uploading images."
                          );
                        }

                        if (!currentSlug) {
                          throw new Error(
                            "Please enter project slug before uploading images."
                          );
                        }

                        const data = new FormData();
                        data.append(
                          "file",
                          blobInfo.blob(),
                          blobInfo.filename()
                        );
                        data.append("project_slug", currentSlug);

                        const res = await fetch(
                          `${env.apiBase}/admin/uploads/image`,
                          {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${currentToken}`,
                            },
                            body: data,
                          }
                        );

                        if (!res.ok) {
                          let msg = "Image upload failed";
                          try {
                            const json = await res.json();
                            msg = json?.detail || json?.message || msg;
                          } catch (_) {}
                          throw new Error(msg);
                        }

                        const json = await res.json();

                        if (!json.location) {
                          throw new Error(
                            "Upload succeeded but no image URL returned."
                          );
                        }

                        return json.location;
                      },
                    }}
                  />
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  You can format text, add headings, lists, links, and upload
                  images directly inside the editor.
                </p>
              </div>

              <div>
                <label className="block text-[#00003d] font-semibold mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tagsInput"
                  value={formData.tagsInput}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c896]"
                  placeholder="react, fastapi, docker"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#00003d] font-semibold mb-2">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    name="repo_url"
                    value={formData.repo_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c896]"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div>
                  <label className="block text-[#00003d] font-semibold mb-2">
                    Cover image
                  </label>

                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleCoverUpload(file);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#d4c896]"
                    />

                    {isUploadingCover && (
                      <p className="text-sm text-gray-500">
                        Uploading cover image...
                      </p>
                    )}

                    {formData.cover_image_url && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src={formData.cover_image_url}
                          alt="Cover preview"
                          className="w-full max-h-64 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#00003d] font-semibold mb-2">
                  Published at
                </label>
                <input
                  type="datetime-local"
                  name="published_at"
                  value={formData.published_at}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c896]"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-[#d4c896] text-[#00003d] rounded-lg hover:bg-[#c4b886] transition-colors border-2 border-[#00003d] inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting
                    ? "Saving..."
                    : editingProject
                    ? "Update project"
                    : "Create project"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-600 text-lg">
              Loading projects...
            </div>
          ) : normalizedProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">
                No projects yet. Create your first one above.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-[#00003d] mb-6">
                Existing Projects
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {normalizedProjects.map((project) => {
                  const projectTags = Array.isArray(project.tags)
                    ? project.tags
                    : [];

                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg p-6 border border-gray-200 flex flex-col"
                    >
                      <h3 className="text-xl font-semibold text-[#00003d] mb-2">
                        {project.title}
                      </h3>

                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {project.description || "No description"}
                      </p>

                      <p className="text-sm text-gray-500 mb-4">
                        <span className="font-medium">Slug:</span>{" "}
                        {project.slug}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {projectTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id ?? tag.name ?? tag}
                            className="px-2 py-1 text-sm bg-[#f5f3e8] text-[#00003d] rounded"
                          >
                            {typeof tag === "string" ? tag : tag.name}
                          </span>
                        ))}

                        {projectTags.length > 3 && (
                          <span className="px-2 py-1 text-sm bg-[#f5f3e8] text-[#00003d] rounded">
                            +{projectTags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleEdit(project)}
                          className="flex-1 px-4 py-2 bg-[#f5f3e8] text-[#00003d] rounded hover:bg-[#e5e3d8] transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(project)}
                          className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
