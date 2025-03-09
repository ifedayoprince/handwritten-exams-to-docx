import { NextResponse } from "next/server"
import * as os from "os"

// In-memory storage for logs and processed files
// In a real implementation, these would be persisted
const logs: { timestamp: string; message: string; type: "info" | "error" }[] = []
const processedFiles: string[] = []

// Function to get the server's IP address
function getIpAddress() {
  const networkInterfaces = os.networkInterfaces()

  // Find the first non-internal IPv4 address
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName]

    if (interfaces) {
      for (const iface of interfaces) {
        // Skip internal and non-IPv4 addresses
        if (!iface.internal && iface.family === "IPv4") {
          return iface.address
        }
      }
    }
  }

  return "localhost"
}

export async function GET() {
  return NextResponse.json({
    ipAddress: getIpAddress(),
    port: process.env.PORT || 3000,
    isRunning: true,
    processedFiles,
    logs,
  })
}

