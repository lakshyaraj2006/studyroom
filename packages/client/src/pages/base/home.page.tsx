import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Sparkles, Clock, ShieldCheck, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/seo.component";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden py-6">
      <SEO
        title="StudyRoom - Find Your Perfect Study Space"
        description="Discover quiet, comfortable study rooms where you can host discussions, focus intensely, and boost your productivity without distractions."
        keywords="study rooms, study spaces, book study room, collaborative learning, productivity"
      />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 md:py-28 bg-background transition-colors duration-300">
        {/* Background decorative glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[650px] h-[300px] md:h-[400px] bg-primary/10 blur-[90px] md:blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[160px] md:w-[350px] h-[160px] bg-indigo-500/5 blur-[60px] md:blur-[90px] rounded-full pointer-events-none" />

        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span>Empowering Collaborative Learning</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight md:leading-none text-foreground">
            Find Your Perfect <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-primary via-violet-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-xs">Study Space</span>
          </h1>

          <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            Discover quiet, comfortable study rooms where you can host active group discussions or focus intensely on your own.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              id="hero-get-started-btn"
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 rounded-xl"
              onClick={() => navigate("/rooms")}
            >
              Get Started <ArrowRight size={16} />
            </Button>

            <Button
              id="hero-learn-more-btn"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto cursor-pointer border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 rounded-xl"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works / Step Section */}
      <section className="relative px-6 py-16 bg-muted/20 border-y border-border/20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              How StudyRoom Works
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Start booking and collaborating in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Atmosphere",
                desc: "Filter through quiet individual focus zones or active collaborative environments depending on your goals.",
                icon: <Sparkles className="w-5 h-5 text-primary" />,
              },
              {
                step: "02",
                title: "Reserve & Invite",
                desc: "Book a slot on the calendar and instantly invite classmates, study groups, or project collaborators.",
                icon: <Calendar className="w-5 h-5 text-primary" />,
              },
              {
                step: "03",
                title: "Meet & Succeed",
                desc: "Access your room, share updates via the discussion feed, and host live sessions without distractions.",
                icon: <MessageSquare className="w-5 h-5 text-primary" />,
              },
            ].map((item, i) => (
              <div key={i} className="relative group bg-card border border-border/40 p-8 rounded-2xl transition-all duration-300 hover:shadow-md">
                <span className="absolute top-6 right-8 text-4xl font-black text-primary/10 tracking-widest group-hover:text-primary/20 transition-colors duration-300">
                  {item.step}
                </span>
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-6">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productivity Stats Section */}
      <section className="px-6 py-16 max-w-5xl mx-auto text-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {[
            { value: "500+", label: "Active Rooms Created" },
            { value: "15k+", label: "Focused Study Hours" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat, i) => (
            <div key={i} className="space-y-2 p-6 rounded-2xl bg-card border border-border/40">
              <h3 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                {stat.value}
              </h3>
              <p className="text-xs md:text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Benefits */}
      <section className="relative px-6 py-16 bg-muted/10 border-t border-border/20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <span>Why StudyRoom?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Built to Solve Workspace Frustrations
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Libraries get crowded, coffee shops are noisy, and scheduling a group session can be a nightmare. StudyRoom provides structured digital and physical space management, ensuring you always have a place to perform your best work.
            </p>
            <div className="grid gap-4">
              {[
                { title: "Smart Scheduling", desc: "Interactive slot calendars ensure no overbooking." },
                { title: "Moderated Spaces", desc: "Hosts maintain controls over member lists and room types." },
                { title: "Discussion Boards", desc: "Post questions and files inside the room feed." }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="p-1 rounded-full bg-primary/10 text-primary h-fit">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-xl bg-card p-6 md:p-8 space-y-4">
            <div className="p-3.5 rounded-xl bg-primary/10 text-primary w-fit">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Always Ready, Instantly Bookable</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our reservation algorithm guarantees rooms are held exclusively for your group's selected slots. No lines, no waitlists, and no stress. Invite members with a secure, generated link.
            </p>
            <Button
              variant="link"
              className="text-primary font-bold p-0 flex items-center gap-1.5 hover:underline cursor-pointer"
              onClick={() => navigate("/rooms")}
            >
              Start browsing rooms <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* Landing CTA Footer Box */}
      <section className="px-6 py-12 max-w-5xl mx-auto w-full z-10">
        <div className="bg-card border border-border/60 shadow-xl p-8 md:p-12 text-center rounded-3xl relative overflow-hidden transition-all duration-300 hover:border-primary/20">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative space-y-4 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Step Into Your Study Room Today
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Join thousands of students and professionals who coordinate their study habits on StudyRoom.
            </p>
            <div className="pt-2">
              <Button
                id="home-cta-rooms-btn"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 font-bold cursor-pointer rounded-xl"
                onClick={() => navigate("/rooms")}
              >
                Find a Room
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}