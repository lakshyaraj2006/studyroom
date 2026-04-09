import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, CalendarCheck, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 bg-linear-to-b from-background to-muted">
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
          Find Your Perfect <span className="text-indigo-500">Study Room</span>
        </h1>

        <p className="mt-4 text-muted-foreground max-w-xl">
          Discover quiet, comfortable spaces where you can focus without distractions.
        </p>

        <div className="mt-6 flex gap-4">
          <Button
            size="lg"
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/rooms")}
          >
            Get Started <ArrowRight size={16} />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate("/about")}
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-10">
          Find Your Ideal Study Space
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Browse Nearby Rooms",
              desc: "Explore study rooms in different locations and pick what suits you best.",
              icon: <MapPin className="text-indigo-500 mb-3" />,
            },
            {
              title: "Book with Ease",
              desc: "Reserve your seat or room quickly without complicated steps.",
              icon: <CalendarCheck className="text-indigo-500 mb-3" />,
            },
            {
              title: "Focused Environment",
              desc: "Choose spaces designed to help you stay productive and consistent.",
              icon: <BookOpen className="text-indigo-500 mb-3" />,
            },
          ].map((item, i) => (
            <Card
              key={i}
              className="rounded-2xl hover:shadow-md transition"
            >
              <CardContent className="p-6">
                {item.icon}
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center bg-indigo-500 text-white">
        <h2 className="text-3xl md:text-4xl font-bold">
          Book your next study session in seconds
        </h2>

        <p className="mt-4 max-w-xl mx-auto">
          Browse available rooms, pick your preferred space, and start studying.
        </p>

        <Button
          size="lg"
          variant="secondary"
          className="mt-6 cursor-pointer flex items-center gap-2 mx-auto hover:bg-white"
          onClick={() => navigate("/rooms")}
        >
          Browse Study Rooms <ArrowRight size={16} />
        </Button>
      </section>

    </div>
  );
}