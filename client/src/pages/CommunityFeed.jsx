import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  MessageSquare,
  Heart,
  Send,
  PlusCircle,
  BarChart2,
  Tag,
  Share2,
  Sparkles,
  HelpCircle,
  Briefcase,
  Flame,
  Search
} from "lucide-react";
import { Modal } from "../components/Modal";
import { api } from "../services/api";

const TAGS = ["All", "Hackathons", "Academics", "Placements", "Lost & Found", "Campus Life"];

export function CommunityFeed({ posts, onUpdatePosts }) {
  const { currentPersona } = useAuth();
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});

  // New post form state
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTag, setPostTag] = useState("Campus Life");
  const [withPoll, setWithPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState({});

  const filteredPosts = posts.filter((post) => {
    const matchesTag = selectedTag === "All" || post.tag.toLowerCase() === selectedTag.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleLike = async (postId) => {
    try {
      const res = await api.likePost(postId, currentPersona?.id);
      onUpdatePosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const likedBy = res.isLiked
              ? [...p.likedBy, currentPersona?.id]
              : p.likedBy.filter((id) => id !== currentPersona?.id);
            return { ...p, likesCount: res.likesCount, likedBy };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const newComment = await api.addComment(postId, {
        authorName: currentPersona?.name || "Anonymous",
        authorRole: currentPersona?.role === "student" ? "3rd Year CSE" : "Faculty",
        text: text.trim()
      });

      onUpdatePosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return { ...p, comments: [...p.comments, newComment] };
          }
          return p;
        })
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  const handleVotePoll = async (postId, optionId) => {
    try {
      const updatedPoll = await api.votePoll(postId, optionId);
      onUpdatePosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return { ...p, poll: updatedPoll };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Vote failed", err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    try {
      setIsSubmitting(true);
      const postPayload = {
        authorId: currentPersona?.id || "student-1",
        title: postTitle.trim(),
        content: postContent.trim(),
        tag: postTag
      };

      if (withPoll && pollQuestion.trim()) {
        const validOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
        if (validOptions.length >= 2) {
          postPayload.pollQuestion = pollQuestion.trim();
          postPayload.pollOptions = validOptions;
        }
      }

      const created = await api.createPost(postPayload);
      onUpdatePosts((prev) => [created, ...prev]);

      // Reset form
      setPostTitle("");
      setPostContent("");
      setPostTag("Campus Life");
      setWithPoll(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Create post failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Campus Buzz</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Flame className="w-4 h-4" />
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time open forum for hackathons, tech discussions, campus queries, and peer help.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Discussion / Poll</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 px-1">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative md:w-64 px-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No discussions found</p>
            <p className="text-xs text-slate-500 mt-1">Be the first student or faculty member to start a thread!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = post.likedBy?.includes(currentPersona?.id);
            const areCommentsOpen = expandedComments[post.id];

            return (
              <article
                key={post.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-xl shadow-slate-950/40"
              >
                {/* Author row */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{post.authorName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({post.authorRole})</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{post.timestamp}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    #{post.tag}
                  </span>
                </div>

                {/* Post Title & Content */}
                <h3 className="text-base font-bold text-white mb-2 leading-snug">{post.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>

                {/* Poll Section (if attached) */}
                {post.poll && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                      <BarChart2 className="w-4 h-4 text-indigo-400" />
                      <span>{post.poll.question}</span>
                    </div>

                    {/* Total votes */}
                    {(() => {
                      const totalVotes = post.poll.options.reduce((sum, opt) => sum + opt.votes, 0);

                      return (
                        <div className="space-y-2 mt-2">
                          {post.poll.options.map((option) => {
                            const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                            const isUserSelected = post.poll.userVoted === option.id;

                            return (
                              <button
                                key={option.id}
                                onClick={() => handleVotePoll(post.id, option.id)}
                                className={`w-full text-left relative p-3 rounded-lg border transition-all cursor-pointer overflow-hidden ${
                                  isUserSelected
                                    ? "bg-indigo-950/40 border-indigo-500/50 text-white ring-1 ring-indigo-500/30"
                                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                                }`}
                              >
                                {/* Progress bar background */}
                                <div
                                  className="absolute left-0 top-0 bottom-0 bg-indigo-600/20 transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                                <div className="relative z-10 flex items-center justify-between text-xs font-medium">
                                  <span>{option.text}</span>
                                  <span className="font-mono text-[11px] text-indigo-300">
                                    {percent}% ({option.votes})
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                          <p className="text-[10px] text-slate-500 text-right mt-1">
                            {totalVotes} total votes
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Engagement bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    {/* Upvote button */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLiked
                          ? "bg-red-500/10 text-red-400 font-semibold border border-red-500/20"
                          : "hover:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{post.likesCount} Upvotes</span>
                    </button>

                    {/* Comments toggle */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500">CampusX Verified</span>
                </div>

                {/* Comments Section */}
                {areCommentsOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3 animate-in fade-in duration-200">
                    {/* Existing comments */}
                    <div className="space-y-2">
                      {post.comments?.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/60 text-xs">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-200">{comment.authorName}</span>
                            <span className="text-slate-500">{comment.time}</span>
                          </div>
                          <p className="text-slate-300 leading-normal">{comment.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add reply input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a reply or answer..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCommentSubmit(post.id);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                        title="Send reply"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Start a Campus Discussion or Poll"
        subtitle={`Posting as ${currentPersona?.name} (${currentPersona?.role})`}
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category Tag</label>
            <select
              value={postTag}
              onChange={(e) => setPostTag(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {TAGS.filter((t) => t !== "All").map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Headline / Question</label>
            <input
              type="text"
              required
              placeholder="e.g. Need team members for SIH 2026 / Placement doubt"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Content Details</label>
            <textarea
              required
              rows={4}
              placeholder="Share context, details, requirements, or links..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Poll toggle */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={withPoll}
                onChange={(e) => setWithPoll(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                Attach an interactive poll
              </span>
            </label>

            {withPoll && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Poll Question</label>
                  <input
                    type="text"
                    placeholder="e.g. Should library remain open 24x7?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-slate-400">Options</label>
                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...pollOptions];
                        copy[i] = e.target.value;
                        setPollOptions(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setPollOptions((prev) => [...prev, ""])}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer pt-1"
                  >
                    + Add option
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
