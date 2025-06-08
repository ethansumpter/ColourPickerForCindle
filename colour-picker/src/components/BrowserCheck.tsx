"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BrowserCheckProps {
  children: React.ReactNode
}

export function BrowserCheck({ children }: BrowserCheckProps) {
  const [isClient, setIsClient] = useState(false)
  const [hasEyeDropper, setHasEyeDropper] = useState(true)

  useEffect(() => {
    setIsClient(true)
    // Check for EyeDropper API support after component mounts
    setHasEyeDropper('EyeDropper' in window)
  }, [])

  // Always render children during SSR and before hydration
  if (!isClient) {
    return <>{children}</>
  }

  // Only show the warning on the client side if EyeDropper is not supported
  if (!hasEyeDropper) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Browser Not Supported</AlertTitle>
          <AlertDescription>
            This application requires the EyeDropper API, which is not available in your current browser. 
            Please use a modern browser like Chrome, Edge, or Safari for the best experience.
          </AlertDescription>
        </Alert>
        {children}
      </div>
    )
  }

  return <>{children}</>
}