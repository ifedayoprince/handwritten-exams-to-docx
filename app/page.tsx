"use client"

import { useState } from "react"
import { CameraCapture } from "@/components/camera-capture"
import { CameraPermission } from "@/components/camera-permission"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"

export default function Home() {
  const [hasPermission, setHasPermission] = useState(false)
  const [images, setImages] = useState<{ id: string; dataUrl: string }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleCapture = (dataUrl: string) => {
    setImages((prev) => [...prev, { id: uuidv4(), dataUrl }])
  }

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleReorder = (reorderedImages: { id: string; dataUrl: string }[]) => {
    setImages(reorderedImages)
  }

  const handleDone = async (documentName: string) => {
    try {
      setIsProcessing(true)
      toast({
        title: "Processing Images",
        description: "Converting your handwritten notes to a document...",
      })

      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: images.map((img) => img.dataUrl),
          documentName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process images")
      }

      const data = await response.json()

      toast({
        title: "Success!",
        description: `Document saved as ${data.filename}`,
      })

      // Clear images after successful processing
      setImages([])
    } catch (error) {
      console.error("Error processing images:", error)
      toast({
        title: "Error",
        description: "Failed to process images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!hasPermission) {
    return <CameraPermission onGranted={() => setHasPermission(true)} />
  }

  return (
    <main className="h-screen w-screen">
      <CameraCapture
        onCapture={handleCapture}
        images={images}
        onRemove={handleRemove}
        onReorder={handleReorder}
        onDone={handleDone}
        isProcessing={isProcessing}
      />
    </main>
  )
}

