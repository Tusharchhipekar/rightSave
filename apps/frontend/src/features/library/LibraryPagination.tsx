import Icon from "@/features/landing/Icon";

const pageBtn =
  "w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors";

export default function LibraryPagination() {
  return (
    <section className="flex flex-col md:flex-row items-center gap-space-md pt-space-md pb-space-lg justify-center">
      <div className="flex items-center gap-space-sm font-label-code text-label-code justify-center">
        <div className="flex items-center gap-1 ml-space-sm">
          <button
            className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center opacity-50 cursor-not-allowed"
            disabled
            type="button"
          >
            <Icon name="chevron_left" className="text-[16px]" />
          </button>
          <button
            className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container font-semibold flex items-center justify-center shadow-xs"
            type="button"
          >
            1
          </button>
          <button className={pageBtn} type="button">2</button>
          <button className={pageBtn} type="button">3</button>
          <span className="px-1 text-outline-variant">...</span>
          <button className={pageBtn} type="button">104</button>
          <button className={pageBtn} type="button">
            <Icon name="chevron_right" className="text-[16px]" />
          </button>
        </div>
      </div>
    </section>
  );
}