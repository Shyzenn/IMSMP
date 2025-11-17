export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <video
        src="SandyLoading.webm"
        autoPlay
        loop
        muted
        playsInline
        className="w-25 h-25"
      />
      <p className="mt-2 text-gray-600 font-medium">Loading...</p>
    </div>
  );
}
