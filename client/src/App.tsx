import { Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "@/pages/auth-page";

function App() {
  return (
    <>
      <Route component={AuthPage} />
      <Toaster />
    </>
  );
}

export default App;
