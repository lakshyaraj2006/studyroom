import RoomForm from "@/components/rooms/room-form.component"
import SEO from "@/components/seo.component"

export default function AddRoomPage() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title="Create Study Room"
                description="Create a new study room on StudyRoom, select tags, set privacy controls, and invite peers to study together."
                keywords="create study room, start study group, study room tags, student collaboration"
            />

            <div className="container max-w-6xl mx-auto px-4 py-12">

                <div className="grid md:grid-cols-2 gap-10 items-center">

                    <div className="space-y-6">
                        <div className="inline-block px-3 py-1 text-sm rounded-full bg-primary/10 text-primary font-medium">
                            Study smarter
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                            Create your{" "}
                            <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Study Room</span>
                        </h1>

                        <p className="text-muted-foreground text-base md:text-lg">
                            Organize topics, collaborate with peers, and stay consistent.
                            Build a focused space for your learning journey.
                        </p>

                        {/* optional feature points */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>• Track topics with tags</p>
                            <p>• Stay consistent with a tagline</p>
                            <p>• Keep everything organized</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border/40 rounded-2xl shadow-xl shadow-primary/5 p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-foreground">Start a new room</h2>
                            <p className="text-sm text-muted-foreground">
                                It takes less than a minute
                            </p>
                        </div>

                        <RoomForm />
                    </div>
                </div>
            </div>
        </div>
    )
}