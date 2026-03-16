import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { env } from "../../config/env";

const ProjectsContext = createContext(null);

async function apiGet(path) {
  const res = await fetch(`${env.apiBase}${path}`);
  let json = null;
  try {
    json = await res.json();
  } catch (_) {}

  if (!res.ok) {
    const msg = json?.detail || json?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export function ProjectsProvider({ children }) {
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchProjects = async (opts = {}) => {
    const nextQ = opts.q ?? q;
    const nextTag = opts.tag ?? tag;
    const nextPage = opts.page ?? page;
    const nextLimit = opts.limit ?? limit;

    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextTag) params.set("tag", nextTag);
    if (nextPage) params.set("page", String(nextPage));
    if (nextLimit) params.set("limit", String(nextLimit));

    setLoading(true);
    setError("");

    try {
      const res = await apiGet(`/projects?${params.toString()}`);
      setProjects(res?.data || []);
      setMeta(res?.meta || { page: nextPage, limit: nextLimit, total: 0 });

      setQ(nextQ);
      setTag(nextTag);
      setPage(nextPage);
      setLimit(nextLimit);

      return res?.data || [];
    } catch (e) {
      setError(e.message || "Failed to load projects");
      setProjects([]);
      setMeta({ page: nextPage, limit: nextLimit, total: 0 });
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects({ page: 1 });
  }, []);

  const addProject = async (payload) => {
    const res = await fetch(`${env.apiBase}/admin/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.detail || "Create failed");
    }

    setProjects((prev) => [json.data, ...prev]);
    return json.data;
  };

  const updateProject = async (slug, payload) => {
    const res = await fetch(`${env.apiBase}/admin/projects/${slug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.detail || "Update failed");
    }

    setProjects((prev) => prev.map((p) => (p.slug === slug ? json.data : p)));
    return json.data;
  };

  const deleteProject = async (slug) => {
    const res = await fetch(`${env.apiBase}/admin/projects/${slug}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let json = null;
      try {
        json = await res.json();
      } catch (_) {}
      throw new Error(json?.detail || "Delete failed");
    }

    setProjects((prev) => prev.filter((p) => p.slug !== slug));
  };

  const getProjectBySlug = (slug) => projects.find((p) => p.slug === slug);

  const value = useMemo(
    () => ({
      projects,
      meta,
      loading,
      error,
      q,
      tag,
      page,
      limit,
      setQ,
      setTag,
      setPage,
      setLimit,
      fetchProjects,
      addProject,
      updateProject,
      deleteProject,
      getProjectBySlug,
    }),
    [projects, meta, loading, error, q, tag, page, limit, token]
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}
