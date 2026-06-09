import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import SEO from "@/components/seo.component";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-6">
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist on StudyRoom."
        keywords="404, not found, studyroom, error page"
      />
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-base font-medium">
            Page not found
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No route matches{" "}
            <span className="font-mono break-all">
              {location.pathname}
            </span>
          </p>

          <div className="flex gap-2 justify-center mt-4">
            <Button id="not-found-back-btn" variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>

            {/* Home button */}
            <Button id="not-found-home-btn" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}