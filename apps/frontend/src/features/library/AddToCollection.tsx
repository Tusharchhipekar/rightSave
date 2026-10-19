
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@/features/landing/Icon";
import { libraryApi } from "./api";

type Props = { contentId: string };

export default function AddToCollection({ contentId }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: async () => (await libraryApi.listCollections()).items,
    staleTime: 30000,
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: (collectionId: string) =>
      libraryApi.addToCollection(collectionId, contentId),
    onSuccess: (_d, collectionId) => {
      setAdded((prev) => new Set(prev).add(collectionId));
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
    onError: (err: Error) => setError(err.message || "Could not add"),
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const col = await libraryApi.createCollection(name);
      await libraryApi.addToCollection(col.id, contentId);
      return col;
    },
    onSuccess: (col) => {
      setAdded((prev) => new Set(prev).add(col.id));
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
    onError: (err: Error) => setError(err.message || "Could not create"),
  });

  const collections = collectionsQuery.data ?? [];
  const busy = addMutation.isPending || createMutation.isPending;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-body-sm text-body-sm shadow-xs"
      >
        <Icon name="create_new_folder" className="text-[16px]" />
        <span>Add to collection</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 w-64 p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-2xl flex flex-col gap-1">
          {collectionsQuery.isLoading && (
            <span className="px-2 py-1.5 text-body-sm text-on-surface-variant">Loading...</span>
          )}
          {!collectionsQuery.isLoading && collections.length === 0 && (
            <span className="px-2 py-1.5 text-body-sm text-on-surface-variant">
              No collections yet
            </span>
          )}
          <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5">
            {collections.map((c) => {
              const done = added.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={busy || done}
                  onClick={() => {
                    setError(null);
                    addMutation.mutate(c.id);
                  }}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-container text-on-surface text-body-sm text-left disabled:opacity-60"
                >
                  <span className="truncate">{c.name}</span>
                  {done ? (
                    <Icon name="check" className="text-primary text-[16px] shrink-0" />
                  ) : (
                    <span className="text-outline text-label-code-sm shrink-0">
                      {c.contentCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 pt-1 mt-1 border-t border-outline-variant/20">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim() && !busy) {
                  setError(null);
                  createMutation.mutate(newName.trim());
                }
              }}
              placeholder="New collection..."
              className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-surface-container text-on-surface placeholder:text-outline text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              disabled={!newName.trim() || busy}
              onClick={() => {
                setError(null);
                createMutation.mutate(newName.trim());
              }}
              className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-body-sm font-medium disabled:opacity-40"
            >
              Add
            </button>
          </div>

          {error && <span className="px-2 text-error text-label-code-sm">{error}</span>}
        </div>
      )}
    </div>
  );
}