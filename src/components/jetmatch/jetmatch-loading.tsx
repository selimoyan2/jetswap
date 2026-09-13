import React from 'react'

export function JetMatchLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="JetMatch yükleniyor">
      {/* Source Item Selector Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-44 bg-zinc-200 rounded-md" />
        <div className="flex gap-3 overflow-hidden pb-2 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="min-w-[240px] sm:min-w-0 bg-white border border-zinc-200 rounded-2xl p-3 flex items-center gap-3 shrink-0"
            >
              <div className="w-14 h-14 bg-zinc-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-200 rounded-md" />
                <div className="h-3 w-1/2 bg-zinc-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-zinc-200/80">
        <div className="space-y-1.5">
          <div className="h-6 w-48 bg-zinc-200 rounded-md" />
          <div className="h-4 w-36 bg-zinc-100 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-zinc-200 rounded-xl" />
          <div className="h-9 w-28 bg-zinc-100 rounded-xl" />
          <div className="h-9 w-20 bg-zinc-100 rounded-xl" />
        </div>
      </div>

      {/* Match Cards Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="bg-white border border-zinc-200 rounded-3xl p-5 space-y-4 shadow-xs"
          >
            {/* Header Badge & Score */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-zinc-200 rounded-full" />
              <div className="h-7 w-16 bg-zinc-200 rounded-xl" />
            </div>

            {/* Image Placeholder */}
            <div className="aspect-4/3 w-full bg-zinc-200 rounded-2xl" />

            {/* Title & Category */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-20 bg-zinc-100 rounded-md" />
                <div className="h-4 w-16 bg-zinc-100 rounded-md" />
              </div>
              <div className="h-5 w-4/5 bg-zinc-200 rounded-md" />
              <div className="h-4 w-1/3 bg-zinc-100 rounded-md" />
            </div>

            {/* Reasons Skeleton */}
            <div className="p-3 bg-zinc-50 rounded-xl space-y-2 border border-zinc-100">
              <div className="h-3.5 w-3/4 bg-zinc-200 rounded-md" />
              <div className="h-3.5 w-2/3 bg-zinc-200 rounded-md" />
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex gap-2">
              <div className="h-10 flex-1 bg-zinc-200 rounded-xl" />
              <div className="h-10 flex-1 bg-zinc-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
