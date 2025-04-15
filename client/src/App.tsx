import { Switch, Route } from "wouter";
import ChatPage from "./pages/ChatPage";
import NotFound from "@/pages/not-found";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/chat" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
