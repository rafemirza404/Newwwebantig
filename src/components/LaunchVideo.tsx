"use client";

const LaunchVideo = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-10">
          Watch How It Works
        </h2>
        <div className="rounded-2xl overflow-hidden shadow-xl">
          <video
            className="w-full aspect-video"
            controls
            autoPlay
            muted
            playsInline
            src="/videos/0223.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};

export default LaunchVideo;
