"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { useState } from "react"

interface ImageGalleryProps {
  images: { id: string; dataUrl: string }[]
  onRemove: (id: string) => void
  onReorder: (reorderedImages: { id: string; dataUrl: string }[]) => void
  onDone?: (documentName: string) => void
  isProcessing?: boolean
}

export function ImageGallery({ images, onRemove, onReorder, onDone, isProcessing = false }: ImageGalleryProps) {
  const [documentName, setDocumentName] = useState("")

  const moveImage = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === images.length - 1)) {
      return
    }

    const newImages = [...images]
    const newIndex = direction === "up" ? index - 1 : index + 1

    // Swap the images using a temporary variable instead of destructuring
    const temp = newImages[index]
    newImages[index] = newImages[newIndex]
    newImages[newIndex] = temp

    onReorder(newImages)
  }

  if (images.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-md">
        <p className="text-muted-foreground">No images captured yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Captured Images ({images.length})</h3>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Document name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="w-48"
            disabled={isProcessing}
          />
          {onDone && (
            <Button
              onClick={() => onDone(documentName || `document_${new Date().toISOString()}`)}
              disabled={images.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Done"
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pb-4">
        {images.map((image, index) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={image.dataUrl || "/placeholder.svg"}
                alt={`Captured image ${index + 1}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                  onClick={() => onRemove(image.id)}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-2 flex justify-between items-center bg-muted">
              <span className="text-sm font-medium">Page {index + 1}</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveImage(index, "up")}
                  disabled={index === 0 || isProcessing}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveImage(index, "down")}
                  disabled={index === images.length - 1 || isProcessing}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

