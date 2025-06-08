"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BrowserCheckProps {
  children: React.ReactNode
}

export function BrowserCheck({ children }: BrowserCheckProps) {
  const [isSupported, setIsSupported] = useState(true)
  const [browserName, setBrowserName] = useState<string>("")

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    
    // Check for supported browsers
    const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent) && !/opr/.test(userAgent)
    const isEdge = /edg/.test(userAgent)
    const isOpera = /opr/.test(userAgent) || /opera/.test(userAgent)
    
    // Get browser name for message
    let name = "unknown browser"
    if (/firefox/.test(userAgent)) name = "Firefox"
    else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) name = "Safari"
    else if (isChrome) name = "Chrome"
    else if (isEdge) name = "Edge"
    else if (isOpera) name = "Opera"
    
    setBrowserName(name)
    setIsSupported(isChrome || isEdge || isOpera)
  }, [])

  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Alert variant="destructive" className="max-w-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unsupported Browser</AlertTitle>
          <AlertDescription className="mt-2">
            <p>
              You are currently using <strong>{browserName}</strong>. This application requires Chrome, Edge, or Opera to function correctly.
            </p>
            <p className="mt-2">
              Please switch to one of these supported browsers to continue.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return children
} 