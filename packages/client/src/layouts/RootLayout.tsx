import Footer from "@/components/footer.component";
import Navbar from "@/components/navbar.component";
import { AppSidebar } from "@/components/sidebar/app-sidebar.component";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout() {
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex min-h-screen w-full">
                <AppSidebar />

                <div className="flex flex-1 flex-col">
                    <Navbar />

                    <main className="flex-1">
                        <Outlet />
                    </main>

                    <Footer />
                </div>

            </div>

            <Toaster />
        </SidebarProvider>
    );
}