let serverURL;
let socket;
let reconnectInterval = 10;

const latencyDisplay = document.getElementById('latency');
const connectionStatus = document.getElementById('connection-status');

const latencyHistory = [];
const maxHistory = 50;
let chart;

if (window.location.protocol == 'http:') 
  serverURL = "ws://" + location.host + "/ws";
else
  serverURL = "wss://" + location.host + "/ws";

function connect() {
  socket = new WebSocket(serverURL);

  // Show connection status
  socket.onopen = () => {
    connectionStatus.textContent = "Connected!";
    connectionStatus.style.color = "#00e676"; // Green for connected
    startLatencyTest();
  };

  socket.onclose = () => {
    connectionStatus.textContent = "Disconnected! Attempting to reconnect...";
    connectionStatus.style.color = "#ff5252"; // Red for disconnected
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
  }, 100);
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
          backgroundColor: 'rgba(0, 230, 118, 0.2)',
          borderColor: '#00e676',
          data: latencyHistory,
        }]
      },
      options: {
        scales: {
          x: {
            beginAtZero: false,
            ticks: {
              color: '#ffffff' // White labels
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)' // Light grid lines
            }
          },
          y: {
            beginAtZero: false,
            max: 100,
            ticks: {
              color: '#ffffff' // White labels
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)' // Light grid lines
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#ffffff' // White labels for the legend
            }
          }
        }
      }
    });
  } else {
    chart.data.datasets[0].data = latencyHistory;
    chart.update('none');
  }
}

// Start connection on page load
connect();
