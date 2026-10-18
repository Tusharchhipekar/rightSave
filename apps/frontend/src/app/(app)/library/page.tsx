import LibraryCard from "@/features/library/LibraryCard";
import LibraryPagination from "@/features/library/LibraryPagination";
import LibraryToolbar from "@/features/library/LibraryToolbar";
import { LIBRARY_CARDS } from "@/features/library/library-data";
import Icon from "@/features/landing/Icon";

export default function LibraryPage() {
  return (
    <main className="w-full pt-16 bg-surface">
      <div className="flex flex-col w-full">
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary-container/10 blur-[130px] rounded-[0.75rem] pointer-events-none"></div>
          <div className="absolute top-24 w-[420px] h-[420px] bg-secondary/5 blur-[120px] rounded-[0.75rem] pointer-events-none"></div>
          <div className="w-full px-margin py-space-lg flex flex-col gap-space-lg max-w-[1720px] mx-auto">
            <LibraryToolbar />
            <section aria-label="Indexed Reel Nodes" className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Icon name="filter_center_focus" className="text-secondary text-[20px]" />
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                    Indexed Knowledge Nodes
                  </h2>
                </div>
                <span className="font-label-code text-label-code text-on-surface-variant">
                  Sorted by: Recently Indexed
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {LIBRARY_CARDS.map((card) => (
                  <LibraryCard key={card.title} card={card} />
                ))}
              </div>
            </section>
            <LibraryPagination />
          </div>
        </div>
      </div>
    </main>
  );
}