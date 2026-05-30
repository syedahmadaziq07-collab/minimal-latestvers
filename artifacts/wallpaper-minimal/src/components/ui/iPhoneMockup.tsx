import { useState, useEffect } from "react";
import { useListWallpapers, getListWallpapersQueryKey } from "@/lib/queries";

export function IPhoneMockup() {
  const { data: featured } = useListWallpapers(
    { featured: true },
    { query: { queryKey: getListWallpapersQueryKey({ featured: true }) } }
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const fallbackImages = [
    "/placeholder-1.png",
    "/placeholder-2.png",
    "/placeholder-3.png",
    "/placeholder-4.png",
  ];

  const images =
    featured && featured.length > 0
      ? featured.map((f) => f.image_url)
      : fallbackImages;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative mx-auto w-[280px] h-[580px] sm:w-[320px] sm:h-[660px] bg-black rounded-[50px] shadow-2xl p-[12px] border-[1px] border-gray-800">
      <div className="absolute top-0 inset-x-0 h-4 w-full flex justify-center z-20 pt-[20px]">
        <div className="w-[100px] h-[30px] bg-black rounded-full" />
      </div>
      <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-gray-900 isolation-isolate">
        {images.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
    </div>
  );
}
