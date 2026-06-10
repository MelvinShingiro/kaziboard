import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
};

function App() {
  const [apiStatus, setApiStatus] = useState<string>("checking...");

  useEffect(() => {
    async function checkApiHealth() {
      try {
        const response = await fetch("http://localhost:4000/health");
        const data: HealthResponse = await response.json();

        setApiStatus(data.status);
      } catch {
        setApiStatus("error connecting to API");
      }
    }

    checkApiHealth();
  }, []);

  return (
    <main>
      <h1>KaziBoard</h1>
      <p>Frontend is running.</p>
      <p>API status: {apiStatus}</p>
    </main>
  );
}

export default App;