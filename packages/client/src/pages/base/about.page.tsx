import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, Compass, HelpCircle, HeartHandshake, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/seo.component";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden py-12">
      <SEO
        title="About StudyRoom - Our Vision & Values"
        description="Learn about the mission, values, and platform guidelines behind StudyRoom, the ultimate platform for quiet study spaces and collaborative group learning."
        keywords="about studyroom, quiet study spaces, study room booking, collaborative learning, student productivity"
      />

      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[180px] md:w-[300px] h-[180px] bg-indigo-500/5 rounded-full blur-[70px] pointer-events-none" />

      {/* Intro Vision Hero Section */}
      <section className="relative px-6 py-12 md:py-20 text-center max-w-4xl mx-auto space-y-6 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide">
          <span>Our Story & Vision</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
          Reimagining the <br />
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent">Study Experience</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
          StudyRoom was founded on a simple premise: technology should make finding a productive environment easy, not stressful. We connect learners, project groups, and mentors with structured spaces that facilitate deep focus.
        </p>
      </section>

      {/* The Problem vs Our Solution Section */}
      <section className="relative px-6 py-12 max-w-5xl mx-auto z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Bridging the Workspace Gap
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Why traditional study coordination fails and how we solve it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* The Problem */}
          <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
              <AlertCircle size={20} /> Traditional Obstacles
            </h3>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-destructive">•</span>
                Noisy coffee shops and libraries with zero guaranteed seating.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-destructive">•</span>
                Fragmented chat groups for organizing project sessions.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-destructive">•</span>
                Lack of built-in focus tools, leading to constant distractions.
              </li>
            </ul>
          </div>

          {/* Our Solution */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <HeartHandshake size={20} /> The StudyRoom Way
            </h3>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-primary">•</span>
                Instant, structured booking with clear member invitations.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">•</span>
                Dedicated in-room group discussion boards for files and links.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">•</span>
                Custom room configurations matching your collaborative mood.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="relative px-6 py-16 bg-muted/20 border-y border-border/20 transition-colors duration-300 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Our Core Values
            </h2>
            <p className="text-muted-foreground text-sm">
              The driving principles behind everything we build at StudyRoom.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Focus First",
                desc: "We prioritize structured quiet and minimal noise to ensure you can reach a deep state of concentration quickly.",
                icon: <BookOpen className="w-5 h-5" />,
              },
              {
                title: "Collaborative Growth",
                desc: "We build features that make group projects, peer tutoring, and knowledge sharing feel organic and frictionless.",
                icon: <Users className="w-5 h-5" />,
              },
              {
                title: "Inclusive Access",
                desc: "No barriers. Setting up and joining study environments is fast, accessible, and simple for all users.",
                icon: <Compass className="w-5 h-5" />,
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="bg-card border border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 rounded-2xl"
              >
                <CardContent className="p-6 md:p-8 flex flex-col items-start text-left">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary mb-5">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Etiquette / Guidelines */}
      <section className="relative px-6 py-12 max-w-4xl mx-auto z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
            <HelpCircle className="text-primary w-6 h-6" /> Workspace Etiquette
          </h2>
          <p className="text-muted-foreground text-sm">
            Guidelines to keep StudyRoom highly productive and welcoming for everyone.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              title: "Respect Quiet Zones",
              desc: "In rooms configured as 'Quiet Study', limit conversation and interactions to focus on individual study tasks."
            },
            {
              title: "Active Participation",
              desc: "In group collaboration rooms, contribute questions, answers, and resources openly with your colleagues."
            },
            {
              title: "Considerate Bookings",
              desc: "Only book slots you intend to use. If your plans change, cancel your reservation so others can use the slot."
            },
            {
              title: "Positive Interactions",
              desc: "Maintain a professional, supportive, and kind atmosphere in chat feeds and discussion posts."
            }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-border/40 bg-card flex gap-4 items-start">
              <span className="font-extrabold text-primary/35 text-lg mt-0.5">0{idx + 1}</span>
              <div>
                <h4 className="font-semibold text-foreground text-sm md:text-base">{item.title}</h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="px-6 py-12 max-w-4xl mx-auto w-full z-10">
        <Card className="bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 text-white shadow-2xl p-8 md:p-12 text-center rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-black/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2" />
          <div className="relative space-y-4 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ready to Discover Rooms?
            </h2>
            <p className="text-xs md:text-sm opacity-90 leading-relaxed">
              Browse public study sessions or create a custom private room to study with your classmates or project group.
            </p>
            <div className="pt-2">
              <Button
                id="about-browse-rooms-btn"
                variant="secondary"
                className="w-full sm:w-auto bg-white text-indigo-700 hover:bg-slate-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 font-bold cursor-pointer rounded-xl"
                onClick={() => navigate("/rooms")}
              >
                Browse Study Rooms <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
