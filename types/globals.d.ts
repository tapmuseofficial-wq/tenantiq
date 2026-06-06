declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Matches the gtag function injected by the Google tag in app/layout.tsx
declare function gtag(...args: unknown[]): void
