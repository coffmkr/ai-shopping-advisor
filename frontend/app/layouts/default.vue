<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b border-stone-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <NuxtLink to="/" class="text-lg font-semibold tracking-tight">AI Shopping Advisor</NuxtLink>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <slot />
    </main>

    <AffiliateNotice />
  </div>
</template>
