const serverURL = 'ws://localhost:8080/ws'; // Replace with your WebSocket server URL
let socket;
let reconnectInterval = 1000; // 1 second

const latencyDisplay = document.getElementById('latency');
const connectionStatus = document.getElementById('connection-status');

const latencyHistory = [];
const maxHistory = 50;
let chart;

function connect() {
  socket = new WebSocket(serverURL);

  // Show connection status
  socket.onopen = () => {
    connectionStatus.textContent = "Connected!";
    connectionStatus.style.color = "green";
    startLatencyTest();
  };

  socket.onclose = () => {
    connectionStatus.textContent = "Disconnected! Attempting to reconnect...";
    connectionStatus.style.color = "red";
    reconnect();
  };

  socket.onerror = (error) => {
    console.log("WebSocket error: ", error);
  };

  // Handle incoming messages
  socket.onmessage = (event) => {
    const receiveTime = Date.now();
    const sentTime = parseInt(event.data, 10);
    const latency = receiveTime - sentTime;

    latencyDisplay.textContent = latency;

    // Add to history for chart display
    if (latencyHistory.length >= maxHistory) latencyHistory.shift();
    latencyHistory.push(latency);
    updateChart();
  };
}

function reconnect() {
  setTimeout(() => {
    connect(); // Try to reconnect
  }, reconnectInterval);
}

function startLatencyTest() {
  setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      const currentTime = Date.now();
      socket.send(currentTime.toString());
    }
  }, 500); // Send ping every 0.5 seconds
}

function updateChart() {
  if (!chart) {
    const ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: maxHistory }, (_, i) => i + 1),
        datasets: [{
          label: 'Latency (ms)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          data: latencyHistory,
        }]
      },
      options: {
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          }
        }
      }
    });
  } else {
    chart.data.datasets[0].data = latencyHistory;
    chart.update();
  }
}

// Start connection on page load
connect();
