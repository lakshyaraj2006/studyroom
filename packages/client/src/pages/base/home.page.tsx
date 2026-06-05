import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, CalendarCheck, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/* Hero Section with Modern Background Grid and Glows */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 bg-background transition-colors duration-300">
        {/* Background decorative glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[400px] bg-primary/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[150px] md:w-[300px] h-[150px] bg-indigo-500/5 blur-[50px] md:blur-[80px] rounded-full pointer-events-none" />

        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span>Empowering Collaborative Learning</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight md:leading-none text-foreground">
            Find Your Perfect <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent drop-shadow-xs">Study Space</span>
          </h1>

          <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            Discover quiet, comfortable study rooms where you can host discussions, focus intensely, and boost your productivity without distractions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              onClick={() => navigate("/rooms")}
            >
              Get Started <ArrowRight size={16} />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto cursor-pointer border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section with Premium Hover-effect Cards */}
      <section className="relative px-6 py-20 bg-muted/30 border-y border-border/20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Designed for High Productivity
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Everything you need to find, book, and enjoy state-of-the-art quiet environments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Browse Nearby Rooms",
                desc: "Explore high-quality study spaces in various locations, filtered to match your group size and study preferences.",
                icon: <MapPin className="text-primary w-6 h-6" />,
              },
              {
                title: "Book with Ease",
                desc: "Reserve your seat or private group room instantly. Seamless invite process for your colleagues and friends.",
                icon: <CalendarCheck className="text-primary w-6 h-6" />,
              },
              {
                title: "Focused Environment",
                desc: "Equipped rooms designed specifically to keep you productive, consistent, and distraction-free.",
                icon: <BookOpen className="text-primary w-6 h-6" />,
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="group relative overflow-hidden bg-card border border-border/40 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 rounded-2xl"
              >
                <CardContent className="p-8 flex flex-col items-start text-left">
                  <div className="p-3.5 rounded-xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section with Gradient Cards */}
      <section className="px-6 py-20 bg-background transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 text-white shadow-2xl px-8 py-16 md:p-16 text-center">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Ready to Boost Your Grades?
              </h2>

              <p className="opacity-90 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                Unlock distraction-free studying. Host active discussions, organize study circles, and schedule session reminders.
              </p>

              <div className="pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 mx-auto bg-white text-indigo-700 hover:bg-slate-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 font-bold"
                  onClick={() => navigate("/rooms")}
                >
                  Browse Study Rooms <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}