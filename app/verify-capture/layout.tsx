export default function VerifyCaptureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand p-4">
      {children}
    </div>
  );
}
