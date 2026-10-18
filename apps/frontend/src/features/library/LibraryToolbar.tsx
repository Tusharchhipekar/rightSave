import Icon from "@/features/landing/Icon";
import { LIBRARY_PILLS } from "./library-data";

export default function LibraryToolbar() {
  return (
    <>
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm font-label-code-sm text-label-code-sm text-on-surface-variant">
            <span className="flex items-center gap-1 hover:text-on-surface cursor-pointer transition-colors">
              <Icon name="auto_awesome" className="text-[14px] text-primary" />
              RightSave
            </span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-medium">Personal Library</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary ml-space-xs animate-ping"></span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Your Reel Library
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="relative group">
            <button
              className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface shadow-xs transition-all"
              type="button"
            >
              <Icon name="sort" className="text-[16px] text-outline" />
              <span className="font-body-sm text-body-sm font-medium">Recently Indexed</span>
              <Icon name="expand_more" className="text-[14px]" />
            </button>
          </div>
          <div className="flex items-center p-1 rounded-xl bg-surface-container-low shadow-xs">
            <button
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-xs"
              title="Grid View"
              type="button"
            >
              <Icon name="grid_view" className="text-[16px] text-primary" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all"
              title="List View"
              type="button"
            >
              <Icon name="view_list" className="text-[16px]" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all"
              title="Compact Cards"
              type="button"
            >
              <Icon name="dashboard_customize" className="text-[16px]" />
            </button>
          </div>
          <button
            className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-headline-sm text-body-sm font-semibold shadow-lg shadow-primary-container/20 hover:shadow-primary/30 transition-all"
            type="button"
          >
            <Icon name="add_circle" className="text-[18px]" />
            <span>New&nbsp; Collection</span>
          </button>
        </div>
      </header>

      <section className="flex flex-col gap-space-md bg-surface-container-low/70 backdrop-blur-md p-space-md rounded-2xl shadow-md">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none">
            <Icon name="manage_search" className="text-primary text-[20px]" />
          </div>
          <input
            className="w-full pl-11 pr-24 py-3 rounded-xl bg-surface-container text-on-surface placeholder:text-outline text-body-md font-body-md shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.05)] focus:outline-none focus:bg-surface-container-high transition-all"
            placeholder="Search within library (e.g. 'high protein paneer recipes' or 'Postgres setup')..."
            type="text"
            defaultValue=""
          />
          <div className="absolute inset-y-0 right-0 pr-space-md flex items-center gap-2"></div>
        </div>
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold whitespace-nowrap shadow-xs transition-all"
            type="button"
          >
            <Icon name="all_inclusive" className="text-[14px]" />
            <span>All</span>
            <span className="px-1.5 rounded-[0.75rem] bg-on-primary-container/20 text-on-primary-container font-label-code-sm text-label-code-sm">
              2,481
            </span>
          </button>
          {LIBRARY_PILLS.map(([icon, color, label, count]) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md whitespace-nowrap transition-all"
              type="button"
            >
              <Icon name={icon} className={`text-[14px] ${color}`} />
              <span>{label}</span>
              <span className="text-on-surface-variant font-label-code-sm text-label-code-sm">{count}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2 text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-space-xs"></div>
        </div>
      </section>
    </>
  );
}