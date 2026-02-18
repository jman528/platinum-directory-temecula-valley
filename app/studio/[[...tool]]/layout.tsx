export const metadata = {
  title: "Sanity Studio",
  description: "Content management for Real Estate Platform",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body style={{ margin: 0 }} suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
