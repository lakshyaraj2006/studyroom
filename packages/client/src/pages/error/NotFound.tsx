import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-5xl">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base">Sorry, the page you’re looking for doesn’t exist.</p>
          <p className="text-sm text-muted-foreground">
            No route matches <span className="font-mono">{location.pathname}</span>
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Go back home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
