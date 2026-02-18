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
    <div id="sanity-studio" style={{ height: "100vh", width: "100vw" }}>
      {children}
    </div>
  );
}
