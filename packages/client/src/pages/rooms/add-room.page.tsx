import RoomForm from "@/components/rooms/room-form.component"

export default function AddRoomPage() {
    return (
        <div className="min-h-screen bg-linear-to-b from-white to-gray-50">

            <div className="container max-w-6xl mx-auto px-4 py-12">

                <div className="grid md:grid-cols-2 gap-10 items-center">

                    <div className="space-y-6">
                        <div className="inline-block px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-600">
                            Study smarter
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                            Create your{" "}
                            <span className="text-indigo-600">Study Room</span>
                        </h1>

                        <p className="text-gray-600 text-base md:text-lg">
                            Organize topics, collaborate with peers, and stay consistent.
                            Build a focused space for your learning journey.
                        </p>

                        {/* optional feature points */}
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>• Track topics with tags</p>
                            <p>• Stay consistent with a tagline</p>
                            <p>• Keep everything organized</p>
                        </div>
                    </div>

                    <div className="bg-white border rounded-xl shadow-sm p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">Start a new room</h2>
                            <p className="text-sm text-gray-500">
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