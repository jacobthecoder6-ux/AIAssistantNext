import { Switch, Route } from "wouter";
import ChatPage from "./pages/ChatPage";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <Switch>
      <Route path="/" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
