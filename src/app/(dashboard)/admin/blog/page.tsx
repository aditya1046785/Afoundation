"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Plus, Loader2, Trash2, Eye, ExternalLink, PenLine,
  FileText, Globe, Clock, BookOpen, TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { BLOG_STATUS_LABELS } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface Post {
  id: string; title: string; slug: string; excerpt: string | null;
  category: string | null; status: string; publishedAt: string | null;
  views: number; createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT: "bg-orange-50 text-orange-700 border-orange-200",
  ARCHIVED: "bg-slate-50 text-slate-500 border-slate-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PUBLISHED: <Globe className="w-3 h-3" />,
  DRAFT: <Clock className="w-3 h-3" />,
  ARCHIVED: <FileText className="w-3 h-3" />,
};

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/blog?admin=true&pageSize=50");
    const data = await res.json();
    if (data.success) setPosts(data.data.posts);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { toast.success("Post deleted."); fetchPosts(); }
    else toast.error(data.error);
  };

  const totalViews = posts.reduce((a, p) => a + p.views, 0);
  const published = posts.filter(p => p.status === "PUBLISHED").length;
  const drafts = posts.filter(p => p.status === "DRAFT").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Blog Posts</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage blog content for the foundation</p>
        </div>
        <Button
          onClick={() => router.push("/admin/blog/new")}
          className="bg-blue-800 hover:bg-blue-900 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: posts.length, icon: <BookOpen className="w-4 h-4" />, color: "text-blue-600 bg-blue-50" },
          { label: "Published", value: published, icon: <Globe className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Drafts", value: drafts, icon: <Clock className="w-4 h-4" />, color: "text-orange-600 bg-orange-50" },
          { label: "Total Views", value: totalViews.toLocaleString(), icon: <TrendingUp className="w-4 h-4" />, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                {icon}
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-800">{loading ? "–" : value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Posts table ── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-semibold text-slate-500">Title</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Category</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Views</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <BookOpen className="w-10 h-10" />
                        <p className="font-medium text-slate-500">No posts yet</p>
                        <p className="text-sm">Click &quot;New Post&quot; to create your first blog post</p>
                        <Button size="sm" onClick={() => router.push("/admin/blog/new")}
                          className="mt-1 bg-blue-700 hover:bg-blue-800 text-white">
                          <Plus className="w-4 h-4 mr-1" /> Create First Post
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id} className="hover:bg-slate-50 group">
                      <TableCell className="max-w-xs">
                        <p className="text-sm font-medium text-slate-800 truncate">{post.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">/{post.slug}</p>
                      </TableCell>
                      <TableCell>
                        {post.category ? (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{post.category}</span>
                        ) : <span className="text-slate-300">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border flex items-center gap-1 w-fit ${STATUS_COLORS[post.status] || ""}`}>
                          {STATUS_ICONS[post.status]}
                          {BLOG_STATUS_LABELS[post.status as keyof typeof BLOG_STATUS_LABELS] || post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Eye className="w-3 h-3" />{post.views}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(new Date(post.createdAt))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {post.status === "PUBLISHED" && (
                            <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600">
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm"
                            onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600">
                            <PenLine className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm"
                            onClick={() => handleDelete(post.id)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
